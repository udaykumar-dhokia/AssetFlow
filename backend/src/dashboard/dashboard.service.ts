import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service responsible for retrieving dashboard related data such as KPIs and
 * asset return information. It uses the {@link PrismaService} to query the
 * database. All methods return plain JavaScript objects that can be
 * serialised to JSON for API responses.
 */
@Injectable()
export class DashboardService {

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates key performance indicators for the dashboard.
   *
   * @param userId - Identifier of the current user.
   * @param role - Role of the current user (e.g. 'ADMIN', 'ASSET_MANAGER', 'USER').
   * @returns An object containing KPI counts such as available assets, allocated
   *          assets, maintenance requests for today, active bookings, pending
   *          transfers, upcoming returns and overdue returns.
   */
  async getKpis(userId: string, role: string) {
    const isGlobal = role === 'ADMIN' || role === 'ASSET_MANAGER';
    const now = new Date();

    const assetsAvailable = await this.prisma.asset.count({
      where: { status: 'AVAILABLE' },
    });

    const assetsAllocated = await this.prisma.asset.count({
      where: isGlobal ? { status: 'ALLOCATED' } : {
        allocations: {
          some: { allocatedToUserId: userId, status: 'ACTIVE' }
        }
      },
    });

    const maintenanceToday = await this.prisma.maintenanceRequest.count({
      where: {
        status: { in: ['PENDING', 'APPROVED', 'IN_PROGRESS'] },
        ...(isGlobal ? {} : { requestedByUserId: userId }),
      },
    });

    const activeBookings = await this.prisma.resourceBooking.count({
      where: {
        status: 'ONGOING',
        ...(isGlobal ? {} : { userId }),
      },
    });

    const pendingTransfers = await this.prisma.assetAllocation.count({
      where: {
        status: 'TRANSFER_REQUESTED',
        ...(isGlobal ? {} : { allocatedToUserId: userId }),
      },
    });

    const upcomingReturnsCount = await this.prisma.assetAllocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { gte: now },
        ...(isGlobal ? {} : { allocatedToUserId: userId }),
      },
    });

    const overdueReturnsCount = await this.prisma.assetAllocation.count({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { lt: now },
        ...(isGlobal ? {} : { allocatedToUserId: userId }),
      },
    });

    return {
      assetsAvailable,
      assetsAllocated,
      maintenanceToday,
      activeBookings,
      pendingTransfers,
      upcomingReturns: upcomingReturnsCount,
      overdueReturns: overdueReturnsCount,
    };
  }

  /**
   * Retrieves asset return information for the dashboard.
   *
   * @param userId - Identifier of the current user.
   * @param role - Role of the current user.
   * @returns An object containing two arrays: `overdueReturns` and
   *          `upcomingReturns`, each populated with allocation records.
   */
  async getReturns(userId: string, role: string) {
    const isGlobal = role === 'ADMIN' || role === 'ASSET_MANAGER';
    const now = new Date();

    const allocations = await this.prisma.assetAllocation.findMany({
      where: {
        status: 'ACTIVE',
        expectedReturnDate: { not: null },
        ...(isGlobal ? {} : { allocatedToUserId: userId }),
      },
      include: {
        asset: {
          select: { name: true, assetTag: true, photoUrl: true }
        },
        allocatedToUser: {
          select: { name: true, email: true }
        },
      },
      orderBy: {
        expectedReturnDate: 'asc'
      }
    });

    const overdueReturns = allocations.filter(a => a.expectedReturnDate && a.expectedReturnDate < now);
    const upcomingReturns = allocations.filter(a => a.expectedReturnDate && a.expectedReturnDate >= now);

    return {
      overdueReturns,
      upcomingReturns,
    };
  }
}
