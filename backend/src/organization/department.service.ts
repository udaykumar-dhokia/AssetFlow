import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service';
import { createLogger } from '../../utils/logger';
import { successResponse } from '../../utils/response';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

const log = createLogger('DepartmentService');

const DEPARTMENT_SELECT = {
  id: true,
  name: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  parentDepartment: { select: { id: true, name: true } },
  headUser: { select: { id: true, name: true, email: true, role: true } },
  subDepartments: { select: { id: true, name: true, status: true } },
  _count: { select: { members: true } },
};

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Department "${dto.name}" already exists`);
    }

    if (dto.parentDepartmentId) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentDepartmentId },
      });
      if (!parent) throw new NotFoundException('Parent department not found');
    }

    if (dto.headUserId) {
      const head = await this.prisma.user.findUnique({
        where: { id: dto.headUserId },
      });
      if (!head) throw new NotFoundException('Head user not found');
    }

    const department = await this.prisma.department.create({
      data: {
        name: dto.name,
        parentDepartmentId: dto.parentDepartmentId,
        headUserId: dto.headUserId,
      },
      select: DEPARTMENT_SELECT,
    });

    log.info('Department created', { id: department.id, name: department.name });
    return successResponse(department, 'Department created', 'CREATED');
  }

  async findAll() {
    const departments = await this.prisma.department.findMany({
      select: DEPARTMENT_SELECT,
      orderBy: { name: 'asc' },
    });
    return successResponse(departments, 'Departments fetched');
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      select: {
        ...DEPARTMENT_SELECT,
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
    if (!department) throw new NotFoundException('Department not found');
    return successResponse(department, 'Department fetched');
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');

    if (dto.name && dto.name !== department.name) {
      const conflict = await this.prisma.department.findUnique({
        where: { name: dto.name },
      });
      if (conflict) throw new ConflictException(`Department "${dto.name}" already exists`);
    }

    if (dto.parentDepartmentId === id) {
      throw new BadRequestException('A department cannot be its own parent');
    }

    if (dto.parentDepartmentId && dto.parentDepartmentId !== null) {
      const parent = await this.prisma.department.findUnique({
        where: { id: dto.parentDepartmentId },
      });
      if (!parent) throw new NotFoundException('Parent department not found');
    }

    if (dto.headUserId && dto.headUserId !== null) {
      const head = await this.prisma.user.findUnique({ where: { id: dto.headUserId } });
      if (!head) throw new NotFoundException('Head user not found');
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.parentDepartmentId !== undefined && {
          parentDepartmentId: dto.parentDepartmentId,
        }),
        ...(dto.headUserId !== undefined && { headUserId: dto.headUserId }),
      },
      select: DEPARTMENT_SELECT,
    });

    log.info('Department updated', { id });
    return successResponse(updated, 'Department updated');
  }

  async deactivate(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');
    if (department.status === Status.INACTIVE) {
      throw new BadRequestException('Department is already inactive');
    }

    const updated = await this.prisma.department.update({
      where: { id },
      data: { status: Status.INACTIVE },
      select: DEPARTMENT_SELECT,
    });

    log.info('Department deactivated', { id });
    return successResponse(updated, 'Department deactivated');
  }
}
