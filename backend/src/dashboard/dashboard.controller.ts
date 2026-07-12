import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKpis(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    if (!userId || !role) {
      return { error: 'userId and role query parameters are required for now.' };
    }
    return this.dashboardService.getKpis(userId, role);
  }

  @Get('returns')
  async getReturns(
    @Query('userId') userId: string,
    @Query('role') role: string,
  ) {
    if (!userId || !role) {
      return { error: 'userId and role query parameters are required for now.' };
    }
    return this.dashboardService.getReturns(userId, role);
  }
}
