import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * AllocationService handles allocation, transfer, and return logic for assets.
 * It also schedules a daily job to flag overdue allocations.
 */
@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Allocates an asset to a user or department.
   * @param dto - Allocation creation DTO.
   * @returns The created allocation record.
   * @throws ConflictException if the asset is already allocated or under transfer.
   */
  async allocate(dto: CreateAllocationDto) {
    const existingActive = await this.prisma.assetAllocation.findFirst({
      where: {
        assetId: dto.assetId,
        status: { in: ['ACTIVE', 'TRANSFER_REQUESTED'] },
      },
      include: {
        allocatedToUser: true,
      },
    });

    if (existingActive) {
      throw new ConflictException({
        message: `Asset is currently held by ${existingActive.allocatedToUser?.name || 'someone else'} (or is under a transfer request).`,
        currentAllocationId: existingActive.id,
      });
    }

    const allocation = await this.prisma.assetAllocation.create({
      data: {
        assetId: dto.assetId,
        allocatedToUserId: dto.allocatedToUserId,
        allocatedToDepartmentId: dto.allocatedToDepartmentId,
        expectedReturnDate: dto.expectedReturnDate ? new Date(dto.expectedReturnDate) : null,
      },
    });

    await this.prisma.asset.update({
      where: { id: dto.assetId },
      data: { status: 'ALLOCATED' },
    });

    return allocation;
  }

  /**
   * Initiates a transfer request for an active allocation.
   * @param assetId - Identifier of the asset.
   * @param currentUserId - User requesting the transfer.
   * @returns The updated allocation record.
   * @throws BadRequestException if the asset is not active.
   */
  async requestTransfer(assetId: string, currentUserId: string) {
    const activeAllocation = await this.prisma.assetAllocation.findFirst({
      where: { assetId, status: 'ACTIVE' },
    });

    if (!activeAllocation) {
      throw new BadRequestException('Asset is not currently active for transfer.');
    }

    const updated = await this.prisma.assetAllocation.update({
      where: { id: activeAllocation.id },
      data: {
        status: 'TRANSFER_REQUESTED',
        transferReqByUserId: currentUserId,
      },
    });

    return updated;
  }

  /**
   * Approves a pending transfer request and creates a new allocation for the
   * requesting user.
   * @param allocationId - Identifier of the allocation to approve.
   * @returns The new allocation record.
   * @throws BadRequestException if the allocation is not in a transferable state.
   */
  async approveTransfer(allocationId: string) {
    const allocation = await this.prisma.assetAllocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation || allocation.status !== 'TRANSFER_REQUESTED') {
      throw new BadRequestException('Invalid transfer request or already processed.');
    }

    await this.prisma.assetAllocation.update({
      where: { id: allocationId },
      data: {
        status: 'RETURNED',
        actualReturnDate: new Date(),
      },
    });

    const newAllocation = await this.prisma.assetAllocation.create({
      data: {
        assetId: allocation.assetId,
        allocatedToUserId: allocation.transferReqByUserId,
      },
    });

    return newAllocation;
  }

  /**
   * Marks an allocation as returned and updates the asset status.
   * @param allocationId - Identifier of the allocation.
   * @param dto - Return details DTO.
   * @returns The updated allocation record.
   * @throws BadRequestException if the allocation is already returned.
   */
  async returnAsset(allocationId: string, dto: ReturnAssetDto) {
    const allocation = await this.prisma.assetAllocation.findUnique({
      where: { id: allocationId },
    });

    if (!allocation || allocation.status === 'RETURNED') {
      throw new BadRequestException('Allocation not active.');
    }

    const updated = await this.prisma.assetAllocation.update({
      where: { id: allocationId },
      data: {
        status: 'RETURNED',
        actualReturnDate: new Date(),
        returnConditionNotes: dto.returnConditionNotes,
      },
    });

    await this.prisma.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'AVAILABLE' },
    });

    return updated;
  }

  /**
   * Scheduled job that runs daily at midnight to flag overdue allocations.
   * Creates notifications for users with overdue assets.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async flagOverdue() {
    this.logger.log('Running overdue allocations check...');
    const overdueAllocations = await this.prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: {
          lt: new Date(),
        },
      },
      include: {
        asset: true,
      }
    });

    for (const alloc of overdueAllocations) {
      if (alloc.allocatedToUserId) {
        await this.prisma.notification.create({
          data: {
            userId: alloc.allocatedToUserId,
            type: 'OVERDUE_ASSET',
            message: `Your allocation for asset ${alloc.asset.name} is overdue. Please return it or request an extension.`,
            relatedEntityType: 'ASSET_ALLOCATION',
            relatedEntityId: alloc.id,
          },
        });
      }
    }
    this.logger.log(`Flagged ${overdueAllocations.length} overdue allocations.`);
  }
}
