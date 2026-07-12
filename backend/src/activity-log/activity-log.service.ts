import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details as Prisma.InputJsonValue,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(filters: { userId?: string; action?: string; entityType?: string }) {
    return this.prisma.activityLog.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
