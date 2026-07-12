import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportService } from './report.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { Response } from 'express';

@ApiTags('Reports & Analytics')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('utilization')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Get asset utilization trends (most used vs idle)' })
  async getUtilization() {
    return this.reportService.getUtilization();
  }

  @Get('maintenance')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Get maintenance frequency and retirement forecasts' })
  async getMaintenanceAnalytics() {
    return this.reportService.getMaintenanceAnalytics();
  }

  @Get('department-summary')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Get department-wise asset allocation summary' })
  async getDepartmentSummary() {
    return this.reportService.getDepartmentSummary();
  }

  @Get('booking-heatmap')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Get a 2D matrix (Day x Hour) of resource booking frequency' })
  async getBookingHeatmap() {
    return this.reportService.getBookingHeatmap();
  }

  @Get('export')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Export reports as CSV' })
  @ApiQuery({ name: 'type', description: 'utilization | maintenance | department' })
  async exportReport(@Query('type') type: string, @Res() res: Response) {
    const csvString = await this.reportService.generateCsvExport(type);
    
    res.header('Content-Type', 'text/csv');
    res.attachment(`${type}-report.csv`);
    return res.send(csvString);
  }
}
