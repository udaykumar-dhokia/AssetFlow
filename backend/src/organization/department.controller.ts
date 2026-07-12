import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRequest } from '../../utils/jwt.middleware';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Organization - Departments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('organization/departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new department' })
  create(@Body() dto: CreateDepartmentDto, @Req() req: AuthRequest) {
    return this.departmentService.create(dto, req.user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List all departments with hierarchy' })
  findAll() {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get a department with its members' })
  findOne(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update department name, parent or head user' })
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto, @Req() req: AuthRequest) {
    return this.departmentService.update(id, dto, req.user.sub);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate a department' })
  deactivate(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.departmentService.deactivate(id, req.user.sub);
  }
}
