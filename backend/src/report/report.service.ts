import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';

/**
 * ReportService provides various analytical reports such as utilization,
 * maintenance analytics, department summaries and booking heatmaps. It also
 * supports CSV export of the generated data.
 */
@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates asset utilization over the past 90 days.
   * @returns Object containing most used and idle assets.
   */
  async getUtilization() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const assets = await this.prisma.asset.findMany({
      include: {
        allocations: {
          where: { createdAt: { gte: ninetyDaysAgo } }
        },
        bookings: {
          where: { startTime: { gte: ninetyDaysAgo } }
        }
      }
    });

    const utilizationScores = assets.map(asset => {
      const allocationCount = asset.allocations.length;
      const bookingCount = asset.bookings.length;
      const totalUsage = allocationCount + bookingCount;
      return {
        assetId: asset.id,
        name: asset.name,
        tag: asset.assetTag,
        isShared: asset.isSharedBookable,
        totalUsage,
      };
    });

    utilizationScores.sort((a, b) => b.totalUsage - a.totalUsage);

    const mostUsed = utilizationScores.slice(0, 10);
    const idle = utilizationScores.filter(a => a.totalUsage === 0);

    return { mostUsed, idle };
  }

  /**
   * Provides maintenance analytics including frequency by category, assets
   * due for maintenance and those nearing retirement.
   * @returns Analytics data object.
   */
  async getMaintenanceAnalytics() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const assets = await this.prisma.asset.findMany({
      include: {
        category: true,
        _count: {
          select: { maintenanceReqs: true }
        }
      }
    });

    const frequencyByCategory: Record<string, number> = {};
    const dueForMaintenance = [];
    const nearingRetirement = [];

    for (const asset of assets) {
      const catName = asset.category.name;
      frequencyByCategory[catName] = (frequencyByCategory[catName] || 0) + asset._count.maintenanceReqs;

      if (asset._count.maintenanceReqs >= 3) {
        dueForMaintenance.push({
          id: asset.id,
          name: asset.name,
          tag: asset.assetTag,
          requestCount: asset._count.maintenanceReqs
        });
      }

      if (asset.acquisitionDate && asset.acquisitionDate < threeYearsAgo) {
        nearingRetirement.push({
          id: asset.id,
          name: asset.name,
          tag: asset.assetTag,
          acquisitionDate: asset.acquisitionDate
        });
      }
    }

    return {
      frequencyByCategory,
      dueForMaintenance,
      nearingRetirement
    };
  }

  /**
   * Generates a summary of active assets per department with category
   * breakdown.
   * @returns Array of department summaries.
   */
  async getDepartmentSummary() {
    const departments = await this.prisma.department.findMany({
      include: {
        assetAllocations: {
          where: { status: 'ACTIVE' },
          include: { asset: { include: { category: true } } }
        },
        members: {
          include: {
            assetAllocations: {
              where: { status: 'ACTIVE' },
              include: { asset: { include: { category: true } } }
            }
          }
        }
      }
    });

    return departments.map(dept => {
      let totalAssets = dept.assetAllocations.length;
      const categoryCount: Record<string, number> = {};

      dept.assetAllocations.forEach(alloc => {
        const cat = alloc.asset.category.name;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });

      dept.members.forEach(member => {
        totalAssets += member.assetAllocations.length;
        member.assetAllocations.forEach(alloc => {
          const cat = alloc.asset.category.name;
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
      });

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalActiveAssets: totalAssets,
        breakdownByCategory: categoryCount
      };
    });
  }

  /**
   * Builds a heatmap of bookings for the past 30 days.
   * @returns Heatmap array indexed by day and hour.
   */
  async getBookingHeatmap() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bookings = await this.prisma.resourceBooking.findMany({
      where: {
        startTime: { gte: thirtyDaysAgo }
      }
    });

    const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

    for (const booking of bookings) {
      const day = booking.startTime.getDay();
      const hour = booking.startTime.getHours();
      heatmap[day][hour]++;
    }

    return { heatmap };
  }

  /**
   * Generates a CSV string for the requested report type.
   * @param type - One of 'utilization', 'maintenance', or 'department'.
   * @returns CSV string or empty if no data.
   * @throws BadRequestException for unsupported types.
   */
  async generateCsvExport(type: string): Promise<string> {
    let data: any[] = [];
    
    switch (type) {
      case 'utilization':
        const util = await this.getUtilization();
        data = [...util.mostUsed, ...util.idle];
        break;
      case 'maintenance':
        const maint = await this.getMaintenanceAnalytics();
        data = [
          ...maint.dueForMaintenance.map(i => ({ type: 'Due For Maintenance', ...i })),
          ...maint.nearingRetirement.map(i => ({ type: 'Nearing Retirement', ...i }))
        ];
        break;
      case 'department':
        const dept = await this.getDepartmentSummary();
        data = dept.map(d => ({
          departmentName: d.departmentName,
          totalActiveAssets: d.totalActiveAssets,
          ...d.breakdownByCategory
        }));
        break;
      default:
        throw new BadRequestException('Invalid report type. Use utilization, maintenance, or department.');
    }

    if (data.length === 0) return '';

    const headers = Array.from(
      new Set(data.flatMap(obj => Object.keys(obj)))
    );

    const rows = data.map(obj => 
      headers.map(header => {
        const val = obj[header];
        if (val === null || val === undefined) return '';
        const strVal = String(val).replace(/"/g, '""');
        return strVal.includes(',') ? `"${strVal}"` : strVal;
      }).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
