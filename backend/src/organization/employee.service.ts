import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service';
import { createLogger } from '../../utils/logger';
import { successResponse } from '../../utils/response';
import { AssignDepartmentDto } from './dto/assign-department.dto';
import { PromoteRoleDto } from './dto/promote-role.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

import { ActivityLogService } from '../activity-log/activity-log.service';
import { NotificationService } from '../notification/notification.service';

const log = createLogger('EmployeeService');

const EMPLOYEE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  isEmailVerified: true,
  createdAt: true,
  department: { select: { id: true, name: true } },
};

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll() {
    const employees = await this.prisma.user.findMany({
      select: EMPLOYEE_SELECT,
      orderBy: { name: 'asc' },
    });
    return successResponse(employees, 'Employees fetched');
  }

  async findOne(id: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id },
      select: EMPLOYEE_SELECT,
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return successResponse(employee, 'Employee fetched');
  }

  async assignDepartment(id: string, dto: AssignDepartmentDto, adminId: string) {
    const employee = await this.prisma.user.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');

    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) throw new NotFoundException('Department not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { departmentId: dto.departmentId },
      select: EMPLOYEE_SELECT,
    });

    log.info('Employee department assigned', { userId: id, departmentId: dto.departmentId });
    
    await this.activityLogService.logAction(
      adminId,
      'EMPLOYEE_UPDATED',
      'User',
      id,
      { old_department_id: employee.departmentId, new_department_id: dto.departmentId }
    );
    
    await this.notificationService.create(
      id,
      'EMPLOYEE_UPDATED',
      'Department Changed',
      `You have been assigned to the ${department.name} department.`,
      'Department',
      department.id
    );

    return successResponse(updated, 'Department assigned to employee');
  }

  async promoteRole(id: string, dto: PromoteRoleDto, adminId: string) {
    const employee = await this.prisma.user.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');

    if (employee.role === dto.role) {
      throw new BadRequestException(`Employee already has role "${dto.role}"`);
    }

    if (dto.role === Role.DEPT_HEAD && !employee.departmentId) {
      throw new BadRequestException(
        'Employee must be assigned to a department before being promoted to DEPT_HEAD',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: EMPLOYEE_SELECT,
    });

    log.info('Employee role updated', { userId: id, from: employee.role, to: dto.role });
    
    await this.activityLogService.logAction(
      adminId,
      'EMPLOYEE_UPDATED',
      'User',
      id,
      { old_role: employee.role, new_role: dto.role }
    );
    
    await this.notificationService.create(
      id,
      'EMPLOYEE_UPDATED',
      'Role Updated',
      `Your role has been changed to ${dto.role}.`,
      'User',
      id
    );

    return successResponse(updated, `Employee promoted to ${dto.role}`);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, adminId: string) {
    const employee = await this.prisma.user.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');

    if (employee.status === dto.status) {
      throw new BadRequestException(`Employee is already ${dto.status}`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: dto.status },
      select: EMPLOYEE_SELECT,
    });

    log.info('Employee status updated', { userId: id, status: dto.status });
    
    await this.activityLogService.logAction(
      adminId,
      'EMPLOYEE_UPDATED',
      'User',
      id,
      { old_status: employee.status, new_status: dto.status }
    );
    
    // Not notifying them of status change since inactive users might not be able to log in anyway
    
    return successResponse(updated, `Employee ${dto.status.toLowerCase()}`);
  }
}
