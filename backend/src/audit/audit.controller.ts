import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuditItemDto } from './dto/audit-item.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuthRequest } from '../../utils/jwt.middleware';

@ApiTags('Audits')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Create a new audit cycle' })
  async createAuditCycle(@Body() dto: CreateAuditDto) {
    return this.auditService.createAuditCycle(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List all audit cycles' })
  async getAudits() {
    return this.auditService.getAudits();
  }

  @Post(':id/items')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Mark an asset during an active audit cycle' })
  async markAuditItem(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Body() dto: AuditItemDto
  ) {
    return this.auditService.markAuditItem(id, req.user.sub, req.user.role, dto);
  }

  @Get(':id/discrepancies')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Get discrepancy report for an audit cycle' })
  async getDiscrepancyReport(@Param('id') id: string) {
    return this.auditService.getDiscrepancyReport(id);
  }

  @Post(':id/close')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Close an audit cycle and apply status changes (e.g., mark missing as LOST)' })
  async closeAuditCycle(@Param('id') id: string) {
    return this.auditService.closeAuditCycle(id);
  }
}
