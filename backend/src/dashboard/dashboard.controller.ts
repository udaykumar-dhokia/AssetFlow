import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthRequest } from '../../utils/jwt.middleware';

@ApiTags('Dashboard')
@ApiBearerAuth()
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
