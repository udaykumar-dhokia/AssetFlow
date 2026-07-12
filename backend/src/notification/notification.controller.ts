import { Controller, Get, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthRequest } from '../../utils/jwt.middleware';
import { successResponse } from '../../utils/response';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(RolesGuard) // Implicitly requires any valid logged-in user
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  async findAll(@Req() req: AuthRequest, @Query('unreadOnly') unreadOnly?: string) {
    const isUnreadOnly = unreadOnly === 'true';
    const data = await this.notificationService.findAllForUser(req.user.sub, isUnreadOnly);
    return successResponse(data, 'Notifications fetched successfully');
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAllAsRead(@Req() req: AuthRequest) {
    await this.notificationService.markAllAsRead(req.user.sub);
    return successResponse(null, 'All notifications marked as read');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a specific notification as read' })
  async markAsRead(@Param('id') id: string, @Req() req: AuthRequest) {
    await this.notificationService.markAsRead(id, req.user.sub);
    return successResponse(null, 'Notification marked as read');
  }
}
