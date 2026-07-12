import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { ApproveMaintenanceDto } from './dto/approve-maintenance.dto';
import { RejectMaintenanceDto } from './dto/reject-maintenance.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { ResolveMaintenanceDto } from './dto/resolve-maintenance.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRequest } from '../../utils/jwt.middleware';
import { successResponse } from '../../utils/response';

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Raise a new maintenance request' })
  async create(
    @Body() createMaintenanceDto: CreateMaintenanceDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.maintenanceService.create(
      createMaintenanceDto,
      req.user.sub,
      req.user.role,
    );
    return successResponse(data, 'Maintenance request created successfully', 'CREATED');
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List maintenance requests' })
  async findAll(@Req() req: AuthRequest) {
    const data = await this.maintenanceService.findAll(req.user.sub, req.user.role);
    return successResponse(data, 'Maintenance requests fetched successfully');
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'View a specific maintenance request with history' })
  async findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const data = await this.maintenanceService.findOne(id, req.user.sub, req.user.role);
    return successResponse(data, 'Maintenance request fetched successfully');
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Approve a maintenance request' })
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveMaintenanceDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.maintenanceService.approve(id, dto, req.user.sub);
    return successResponse(data, 'Maintenance request approved');
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Reject a maintenance request' })
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectMaintenanceDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.maintenanceService.reject(id, dto, req.user.sub);
    return successResponse(data, 'Maintenance request rejected');
  }

  @Patch(':id/assign-technician')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Assign a technician to an approved request' })
  async assignTechnician(
    @Param('id') id: string,
    @Body() dto: AssignTechnicianDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.maintenanceService.assignTechnician(id, dto, req.user.sub);
    return successResponse(data, 'Technician assigned successfully');
  }

  @Patch(':id/start')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Mark maintenance work as in progress' })
  async startWork(@Param('id') id: string, @Req() req: AuthRequest) {
    const data = await this.maintenanceService.startWork(id, req.user.sub);
    return successResponse(data, 'Maintenance work started');
  }

  @Patch(':id/resolve')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Complete repair and mark as resolved' })
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveMaintenanceDto,
    @Req() req: AuthRequest,
  ) {
    const data = await this.maintenanceService.resolve(id, dto, req.user.sub);
    return successResponse(data, 'Maintenance request resolved and asset is now available');
  }
}
