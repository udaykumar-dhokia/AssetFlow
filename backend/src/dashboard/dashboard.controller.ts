import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../utils/jwt.middleware';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKpis(@Req() req: AuthRequest) {
    return this.dashboardService.getKpis(req.user.sub, req.user.role);
  }

  @Get('returns')
  async getReturns(@Req() req: AuthRequest) {
    return this.dashboardService.getReturns(req.user.sub, req.user.role);
  }
}
