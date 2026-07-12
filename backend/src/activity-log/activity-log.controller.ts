import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { successResponse } from '../../utils/response';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'View system-wide activity logs (Audit Trail)' })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  async findAll(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('entityType') entityType?: string,
  ) {
    const data = await this.activityLogService.findAll({ userId, action, entityType });
    return successResponse(data, 'Activity logs fetched successfully');
  }
}
