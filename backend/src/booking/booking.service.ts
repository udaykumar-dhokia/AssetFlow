import { Injectable, ConflictException, BadRequestException, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * BookingService manages creation, rescheduling, cancellation and status
 * processing of resource bookings. It also sends reminders and handles
 * scheduled status updates.
 */
import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Validates that a proposed booking time window is valid and does not
   * conflict with existing bookings.
   * @param startTime - Proposed start time.
   * @param endTime - Proposed end time.
   * @param assetId - Asset being booked.
   * @param excludeBookingId - Optional booking id to exclude from conflict check.
   * @throws BadRequestException or ConflictException on validation failure.
   */
  private async validateTimes(startTime: Date, endTime: Date, assetId: string, excludeBookingId?: string) {
    const now = new Date();
    if (startTime <= now) {
      throw new BadRequestException('Start time must be in the future.');
    }
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time.');
    }

    const durationMs = endTime.getTime() - startTime.getTime();
    const maxDurationMs = 12 * 60 * 60 * 1000;
    if (durationMs > maxDurationMs) {
      throw new BadRequestException('Booking duration cannot exceed 12 hours.');
    }

    const whereClause: any = {
      assetId,
      status: { in: ['UPCOMING', 'ONGOING'] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };

    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId };
    }

    const overlapping = await this.prisma.resourceBooking.findFirst({
      where: whereClause,
      include: { user: { select: { name: true } } },
    });

    if (overlapping) {
      throw new ConflictException(`Time slot is already booked by ${overlapping.user?.name || 'someone else'}.`);
    }
  }

  /**
   * Creates a new booking for a user.
   * @param userId - Identifier of the user making the booking.
   * @param dto - Booking creation DTO.
   * @returns The created booking record.
   * @throws BadRequestException if the asset is not bookable or times are invalid.
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    const asset = await this.prisma.asset.findUnique({ where: { id: dto.assetId } });
    if (!asset || !asset.isSharedBookable) {
      throw new BadRequestException('Asset is not available for booking.');
    }

    await this.validateTimes(start, end, dto.assetId);

    const booking = await this.prisma.resourceBooking.create({
      data: {
        userId,
        assetId: dto.assetId,
        startTime: start,
        endTime: end,
        status: 'UPCOMING',
      },
    });

    await this.activityLogService.logAction(
      userId,
      'BOOKING_CREATED',
      'ResourceBooking',
      booking.id,
      { new_data: booking }
    );
    
    await this.notificationService.create(
      userId,
      'BOOKING_CREATED',
      'Booking Confirmed',
      `Your booking for ${asset.name} from ${start.toLocaleString()} to ${end.toLocaleString()} is confirmed.`,
      'ResourceBooking',
      booking.id
    );

    return booking;
  }

  /**
   * Retrieves bookings for a specific asset within an optional date range.
   * @param assetId - Asset identifier.
   * @param startDate - Optional start date filter.
   * @param endDate - Optional end date filter.
   * @returns Array of bookings.
   */
  async getBookingsForAsset(assetId: string, startDate?: string, endDate?: string) {
    const where: any = {
      assetId,
      status: { in: ['UPCOMING', 'ONGOING'] },
    };

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate) };
      where.endTime = { lte: new Date(endDate) };
    }

    return this.prisma.resourceBooking.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Cancels an upcoming booking.
   * @param bookingId - Identifier of the booking.
   * @param userId - Identifier of the user attempting cancellation.
   * @param role - Role of the user.
   * @returns The updated booking record.
   * @throws NotFoundException, ForbiddenException, BadRequestException.
   */
  async cancelBooking(bookingId: string, userId: string, role: string) {
    const booking = await this.prisma.resourceBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found.');

    if (booking.userId !== userId && role === 'EMPLOYEE') {
      throw new ForbiddenException('You can only cancel your own bookings.');
    }

    if (booking.status !== 'UPCOMING') {
      throw new BadRequestException(`Cannot cancel a booking that is ${booking.status}.`);
    }

    const updated = await this.prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
    });

    await this.activityLogService.logAction(
      userId,
      'BOOKING_CANCELLED',
      'ResourceBooking',
      updated.id,
      { old_data: booking, new_data: updated }
    );
    
    // Only notify if cancelled by someone else (e.g. ADMIN) or optionally always
    if (booking.userId !== userId) {
      await this.notificationService.create(
        booking.userId,
        'BOOKING_CANCELLED',
        'Booking Cancelled',
        `Your booking for this asset has been cancelled by an administrator.`,
        'ResourceBooking',
        updated.id
      );
    } else {
      await this.notificationService.create(
        userId,
        'BOOKING_CANCELLED',
        'Booking Cancelled',
        `You successfully cancelled your booking.`,
        'ResourceBooking',
        updated.id
      );
    }

    return updated;
  }

  /**
   * Reschedules an existing booking.
   * @param bookingId - Identifier of the booking.
   * @param userId - Identifier of the user attempting reschedule.
   * @param role - Role of the user.
   * @param dto - Reschedule DTO containing new times.
   * @returns The updated booking record.
   * @throws NotFoundException, ForbiddenException, BadRequestException.
   */
  async rescheduleBooking(bookingId: string, userId: string, role: string, dto: RescheduleBookingDto) {
    const booking = await this.prisma.resourceBooking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Booking not found.');

    if (booking.userId !== userId && role === 'EMPLOYEE') {
      throw new ForbiddenException('You can only reschedule your own bookings.');
    }

    if (booking.status !== 'UPCOMING') {
      throw new BadRequestException(`Cannot reschedule a booking that is ${booking.status}.`);
    }

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    await this.validateTimes(start, end, booking.assetId, booking.id);

    const updated = await this.prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { startTime: start, endTime: end },
    });
    
    await this.activityLogService.logAction(
      userId,
      'BOOKING_UPDATED',
      'ResourceBooking',
      updated.id,
      { old_data: booking, new_data: updated }
    );
    
    return updated;
  }

  /**
   * Scheduled job that updates booking statuses from UPCOMING to ONGOING and
   * from ONGOING to COMPLETED based on current time.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processStatuses() {
    this.logger.log('Processing booking statuses...');
    const now = new Date();

    const started = await this.prisma.resourceBooking.updateMany({
      where: {
        status: 'UPCOMING',
        startTime: { lte: now },
      },
      data: { status: 'ONGOING' },
    });

    const completed = await this.prisma.resourceBooking.updateMany({
      where: {
        status: 'ONGOING',
        endTime: { lte: now },
      },
      data: { status: 'COMPLETED' },
    });

    if (started.count > 0 || completed.count > 0) {
      this.logger.log(`Started ${started.count} bookings, Completed ${completed.count} bookings.`);
    }
  }

  /**
   * Scheduled job that sends reminders for bookings starting within the next
   * fifteen minutes.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async sendReminders() {
    this.logger.log('Sending booking reminders...');
    const now = new Date();
    const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    const upcomingBookings = await this.prisma.resourceBooking.findMany({
      where: {
        status: 'UPCOMING',
        startTime: {
          gt: now,
          lte: fifteenMinsFromNow,
        },
      },
      include: { asset: true },
    });

    for (const booking of upcomingBookings) {
      const existing = await this.prisma.notification.findFirst({
        where: {
          relatedEntityId: booking.id,
          type: 'BOOKING_REMINDER',
        },
      });

      if (!existing) {
        await this.notificationService.create(
          booking.userId,
          'BOOKING_REMINDER',
          'Booking Reminder',
          `Reminder: Your booking for ${booking.asset.name} starts at ${booking.startTime.toLocaleTimeString()}.`,
          'ResourceBooking',
          booking.id
        );
      }
    }
  }
}
