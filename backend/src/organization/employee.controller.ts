import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRequest } from '../../utils/jwt.middleware';
import { EmployeeService } from './employee.service';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { PromoteRoleDto } from './dto/promote-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('Organization - Employees')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('organization/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'List all employees with their department and role' })
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Get a single employee detail' })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch(':id/department')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign employee to a department' })
  assignDepartment(@Param('id') id: string, @Body() dto: AssignDepartmentDto, @Req() req: AuthRequest) {
    return this.employeeService.assignDepartment(id, dto, req.user.sub);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Promote or change employee role (ADMIN only)' })
  promoteRole(@Param('id') id: string, @Body() dto: PromoteRoleDto, @Req() req: AuthRequest) {
    return this.employeeService.promoteRole(id, dto, req.user.sub);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Activate or deactivate an employee account' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto, @Req() req: AuthRequest) {
    return this.employeeService.updateStatus(id, dto, req.user.sub);
  }
}
