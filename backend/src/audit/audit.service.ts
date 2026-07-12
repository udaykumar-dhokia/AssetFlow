import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuditItemDto } from './dto/audit-item.dto';

/**
 * AuditService handles audit cycle creation, item updates, discrepancy reporting
 * and closing of audit cycles. It interacts with Prisma to persist audit data.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new audit cycle and associates auditors.
   * @param dto - DTO containing audit details and auditor ids.
   * @returns The created audit cycle with auditors.
   */
  async createAuditCycle(dto: CreateAuditDto) {
    const { auditorIds, ...data } = dto;
    
    return this.prisma.auditCycle.create({
      data: {
        ...data,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        auditors: {
          connect: auditorIds.map(id => ({ id }))
        }
      },
      include: {
        auditors: { select: { id: true, name: true } }
      }
    });
  }

  /**
   * Retrieves all audit cycles ordered by creation date.
   * @returns Array of audit cycles with auditor info and item counts.
   */
  async getAudits() {
    return this.prisma.auditCycle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        auditors: { select: { id: true, name: true } },
        _count: {
          select: { auditItems: true }
        }
      }
    });
  }

  /**
   * Fetches a single audit cycle by id.
   * @param id - Audit cycle identifier.
   * @returns The audit cycle.
   * @throws NotFoundException if not found.
   */
  async getAuditById(id: string) {
    const cycle = await this.prisma.auditCycle.findUnique({
      where: { id },
      include: { auditors: { select: { id: true, name: true } } }
    });
    if (!cycle) throw new NotFoundException('Audit cycle not found');
    return cycle;
  }

  /**
   * Adds or updates an audit item within a cycle.
   * @param cycleId - Audit cycle id.
   * @param userId - User performing the action.
   * @param role - Role of the user.
   * @param dto - Audit item details.
   * @returns The created or updated audit item.
   * @throws BadRequestException or ForbiddenException on invalid state.
   */
  async markAuditItem(cycleId: string, userId: string, role: string, dto: AuditItemDto) {
    const cycle = await this.getAuditById(cycleId);
    
    if (cycle.status === 'CLOSED') {
      throw new BadRequestException('Cannot modify a closed audit cycle.');
    }

    if (role === 'EMPLOYEE') {
      const isAuditor = cycle.auditors.some(a => a.id === userId);
      if (!isAuditor) {
        throw new ForbiddenException('You are not assigned as an auditor for this cycle.');
      }
    }

    const existing = await this.prisma.auditItem.findFirst({
      where: { auditCycleId: cycleId, assetId: dto.assetId }
    });

    if (existing) {
      return this.prisma.auditItem.update({
        where: { id: existing.id },
        data: { status: dto.status, notes: dto.notes }
      });
    } else {
      return this.prisma.auditItem.create({
        data: {
          auditCycleId: cycleId,
          assetId: dto.assetId,
          status: dto.status,
          notes: dto.notes
        }
      });
    }
  }

  /**
   * Determines assets that fall within the audit scope but were not scanned.
   * @param cycleId - Audit cycle id.
   * @returns Array of assets that are implicitly missing.
   */
  private async getImplicitlyMissingAssets(cycleId: string) {
    const cycle = await this.getAuditById(cycleId);
    
    const scopeQuery: any = { status: { notIn: ['DISPOSED', 'RETIRED', 'LOST'] } };
    
    let hasScope = false;
    if (cycle.scopeLocation) {
      scopeQuery.location = cycle.scopeLocation;
      hasScope = true;
    }
    if (cycle.scopeDepartmentId) {
      scopeQuery.allocations = {
        some: {
          status: 'ACTIVE',
          OR: [
            { allocatedToDepartmentId: cycle.scopeDepartmentId },
            { allocatedToUser: { departmentId: cycle.scopeDepartmentId } }
          ]
        }
      };
      hasScope = true;
    }

    const allAssetsInScope = await this.prisma.asset.findMany({ 
      where: scopeQuery,
      select: { id: true, name: true, assetTag: true }
    });

    const scannedItems = await this.prisma.auditItem.findMany({
      where: { auditCycleId: cycleId },
      select: { assetId: true }
    });

    const scannedAssetIds = new Set(scannedItems.map(i => i.assetId));
    
    return allAssetsInScope.filter(a => !scannedAssetIds.has(a.id));
  }

  /**
   * Generates a discrepancy report for a cycle, including explicit and
   * implicitly missing items.
   * @param cycleId - Audit cycle id.
   * @returns Report object with counts and lists.
   */
  async getDiscrepancyReport(cycleId: string) {
    const items = await this.prisma.auditItem.findMany({
      where: { 
        auditCycleId: cycleId,
        status: { in: ['MISSING', 'DAMAGED'] }
      },
      include: {
        asset: { select: { id: true, name: true, assetTag: true } }
      }
    });

    const implicitlyMissing = await this.getImplicitlyMissingAssets(cycleId);

    return {
      explicitDiscrepancies: items,
      implicitlyMissing: implicitlyMissing,
      totalDiscrepancies: items.length + implicitlyMissing.length
    };
  }

  /**
   * Closes an audit cycle, marking missing assets as LOST and finalising the
   * cycle status.
   * @param cycleId - Audit cycle id.
   * @returns The closed audit cycle.
   * @throws BadRequestException if already closed.
   */
  async closeAuditCycle(cycleId: string) {
    const cycle = await this.getAuditById(cycleId);
    
    if (cycle.status === 'CLOSED') {
      throw new BadRequestException('Audit cycle is already closed.');
    }

    const implicitlyMissing = await this.getImplicitlyMissingAssets(cycleId);
    if (implicitlyMissing.length > 0) {
      await this.prisma.auditItem.createMany({
        data: implicitlyMissing.map(asset => ({
          auditCycleId: cycleId,
          assetId: asset.id,
          status: 'MISSING',
          notes: 'Implicitly missing (not scanned during audit scope).'
        }))
      });
    }

    const allMissingItems = await this.prisma.auditItem.findMany({
      where: { auditCycleId: cycleId, status: 'MISSING' }
    });

    const missingAssetIds = allMissingItems.map(i => i.assetId);

    if (missingAssetIds.length > 0) {
      await this.prisma.asset.updateMany({
        where: { id: { in: missingAssetIds } },
        data: { status: 'LOST' }
      });
    }

    const closedCycle = await this.prisma.auditCycle.update({
      where: { id: cycleId },
      data: { status: 'CLOSED' }
    });

    this.logger.log(`Closed audit cycle ${cycleId}. Marked ${missingAssetIds.length} assets as LOST.`);
    return closedCycle;
  }
}
