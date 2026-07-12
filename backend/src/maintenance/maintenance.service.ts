import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { ApproveMaintenanceDto } from './dto/approve-maintenance.dto';
import { RejectMaintenanceDto } from './dto/reject-maintenance.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { ResolveMaintenanceDto } from './dto/resolve-maintenance.dto';

import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationService: NotificationService,
  ) {}

  private async createHistory(
    assetId: string,
    maintenanceRequestId: string,
    action: string,
    oldStatus: string | null,
    newStatus: string | null,
    userId: string,
    remarks?: string,
  ) {
    await this.prisma.maintenanceHistory.create({
      data: {
        assetId,
        maintenanceRequestId,
        action,
        oldStatus,
        newStatus,
        performedByUserId: userId,
        remarks,
      },
    });
  }

  async create(dto: CreateMaintenanceDto, userId: string, role: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: dto.assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.status === 'UNDER_MAINTENANCE') {
      throw new BadRequestException('Asset is already under maintenance');
    }

    // Check if employee holds the asset, unless they are admin/manager
    if (role !== 'ADMIN' && role !== 'ASSET_MANAGER') {
      const activeAllocation = await this.prisma.assetAllocation.findFirst({
        where: {
          assetId: dto.assetId,
          status: 'ACTIVE',
          allocatedToUserId: userId,
        },
      });

      if (!activeAllocation) {
        throw new ForbiddenException(
          'You can only raise maintenance requests for assets currently allocated to you.',
        );
      }
    }

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        assetId: dto.assetId,
        requestedByUserId: userId,
        issueDescription: dto.issueDescription,
        priority: dto.priority,
        photoUrl: dto.photoUrl,
        status: 'PENDING',
      },
    });

    await this.createHistory(
      dto.assetId,
      request.id,
      'CREATED',
      asset.status,
      asset.status,
      userId,
      'Maintenance request raised.',
    );

    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_CREATED',
      'MaintenanceRequest',
      request.id,
      { new_data: request }
    );

    // Notify Asset Managers (Assuming there's logic to fetch managers, simplified for MVP)
    // You could fetch all users with Role.ASSET_MANAGER, but for now we'll just log it
    // if a specific manager was known.
    // Instead we can notify the employee that their request was successfully submitted.
    await this.notificationService.create(
      userId,
      'MAINTENANCE_CREATED',
      'Maintenance Requested',
      `Your maintenance request for ${asset.name} has been submitted.`,
      'MaintenanceRequest',
      request.id
    );

    return request;
  }

  async findAll(userId: string, role: string) {
    const isGlobal = role === 'ADMIN' || role === 'ASSET_MANAGER';
    return this.prisma.maintenanceRequest.findMany({
      where: isGlobal ? {} : { requestedByUserId: userId },
      include: {
        asset: { select: { name: true, assetTag: true, status: true } },
        requestedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const isGlobal = role === 'ADMIN' || role === 'ASSET_MANAGER';
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        requestedBy: { select: { name: true, email: true } },
        history: {
          include: { performedBy: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    if (!isGlobal && request.requestedByUserId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  async approve(id: string, dto: ApproveMaintenanceDto, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING requests can be approved');
    }

    const oldAssetStatus = request.asset.status;
    const newAssetStatus = 'UNDER_MAINTENANCE';

    const updatedRequest = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: dto.technicianName ? 'TECH_ASSIGNED' : 'APPROVED',
        assignedTechnicianName: dto.technicianName,
        asset: {
          update: { status: newAssetStatus },
        },
      },
    });

    await this.createHistory(
      request.assetId,
      request.id,
      dto.technicianName ? 'APPROVED_AND_ASSIGNED' : 'APPROVED',
      oldAssetStatus,
      newAssetStatus,
      userId,
      dto.technicianName ? `Approved and assigned to ${dto.technicianName}` : 'Request approved',
    );
    
    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_APPROVED',
      'MaintenanceRequest',
      request.id,
      { old_data: request, new_data: updatedRequest }
    );
    
    await this.notificationService.create(
      request.requestedByUserId,
      'MAINTENANCE_APPROVED',
      'Maintenance Approved',
      `Your maintenance request for asset ${request.asset.name} has been approved.`,
      'MaintenanceRequest',
      request.id
    );

    return updatedRequest;
  }

  async reject(id: string, dto: RejectMaintenanceDto, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING requests can be rejected');
    }

    const updatedRequest = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await this.createHistory(
      request.assetId,
      request.id,
      'REJECTED',
      request.asset.status,
      request.asset.status, // Status remains unchanged
      userId,
      dto.reason,
    );
    
    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_REJECTED',
      'MaintenanceRequest',
      request.id,
      { old_data: request, new_data: updatedRequest }
    );
    
    await this.notificationService.create(
      request.requestedByUserId,
      'MAINTENANCE_REJECTED',
      'Maintenance Rejected',
      `Your maintenance request for asset ${request.asset.name} was rejected. Reason: ${dto.reason}`,
      'MaintenanceRequest',
      request.id
    );

    return updatedRequest;
  }

  async assignTechnician(id: string, dto: AssignTechnicianDto, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status === 'RESOLVED' || request.status === 'REJECTED') {
      throw new BadRequestException('Cannot assign technician to a closed request');
    }

    const updatedRequest = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'TECH_ASSIGNED',
        assignedTechnicianName: dto.technicianName,
      },
    });

    await this.createHistory(
      request.assetId,
      request.id,
      'TECHNICIAN_ASSIGNED',
      request.asset.status,
      request.asset.status,
      userId,
      `Assigned to ${dto.technicianName}`,
    );
    
    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_UPDATED',
      'MaintenanceRequest',
      request.id,
      { old_data: request, new_data: updatedRequest }
    );
    
    await this.notificationService.create(
      request.requestedByUserId,
      'MAINTENANCE_UPDATED',
      'Technician Assigned',
      `A technician (${dto.technicianName}) has been assigned to your maintenance request.`,
      'MaintenanceRequest',
      request.id
    );

    return updatedRequest;
  }

  async startWork(id: string, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'TECH_ASSIGNED' && request.status !== 'APPROVED') {
      throw new BadRequestException('Invalid status transition');
    }

    const updatedRequest = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });

    await this.createHistory(
      request.assetId,
      request.id,
      'WORK_STARTED',
      request.asset.status,
      request.asset.status,
      userId,
      'Maintenance work started',
    );
    
    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_UPDATED',
      'MaintenanceRequest',
      request.id,
      { old_data: request, new_data: updatedRequest }
    );

    return updatedRequest;
  }

  async resolve(id: string, dto: ResolveMaintenanceDto, userId: string) {
    const request = await this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { asset: true },
    });

    if (!request) throw new NotFoundException('Request not found');
    if (request.status === 'RESOLVED' || request.status === 'REJECTED') {
      throw new BadRequestException('Request is already closed');
    }

    const oldAssetStatus = request.asset.status;
    const newAssetStatus = 'AVAILABLE';

    const updatedRequest = await this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolutionNotes: dto.resolutionNotes,
        asset: {
          update: { status: newAssetStatus },
        },
      },
    });

    await this.createHistory(
      request.assetId,
      request.id,
      'RESOLVED',
      oldAssetStatus,
      newAssetStatus,
      userId,
      dto.resolutionNotes,
    );
    
    await this.activityLogService.logAction(
      userId,
      'MAINTENANCE_RESOLVED',
      'MaintenanceRequest',
      request.id,
      { old_data: request, new_data: updatedRequest }
    );
    
    await this.notificationService.create(
      request.requestedByUserId,
      'MAINTENANCE_RESOLVED',
      'Maintenance Resolved',
      `Your maintenance request for asset ${request.asset.name} has been resolved.`,
      'MaintenanceRequest',
      request.id
    );

    return updatedRequest;
  }
}
