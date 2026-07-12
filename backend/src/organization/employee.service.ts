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
  constructor(private readonly prisma: PrismaService) {}

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

  async assignDepartment(id: string, dto: AssignDepartmentDto) {
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
    return successResponse(updated, 'Department assigned to employee');
  }

  async promoteRole(id: string, dto: PromoteRoleDto) {
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
    return successResponse(updated, `Employee promoted to ${dto.role}`);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
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
    return successResponse(updated, `Employee ${dto.status.toLowerCase()}`);
  }
}
