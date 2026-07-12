import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthRequest } from '../../utils/jwt.middleware';

@ApiTags('Resource Bookings')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Book a shared resource for a specific time slot' })
  async create(@Req() req: AuthRequest, @Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.sub, createBookingDto);
  }

  @Get('asset/:assetId')
  @ApiOperation({ summary: 'Get calendar view of bookings for a specific asset' })
  @ApiQuery({ name: 'startDate', required: false, description: 'ISO Date string' })
  @ApiQuery({ name: 'endDate', required: false, description: 'ISO Date string' })
  async getBookingsForAsset(
    @Param('assetId') assetId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.bookingService.getBookingsForAsset(assetId, startDate, endDate);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an upcoming booking' })
  async cancelBooking(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.bookingService.cancelBooking(id, req.user.sub, req.user.role);
  }

  @Post(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule an upcoming booking' })
  async rescheduleBooking(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: RescheduleBookingDto,
  ) {
    return this.bookingService.rescheduleBooking(id, req.user.sub, req.user.role, dto);
  }
}
