import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service';
import { createLogger } from '../../utils/logger';
import { successResponse } from '../../utils/response';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const log = createLogger('CategoryService');

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const existing = await this.prisma.assetCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    const category = await this.prisma.assetCategory.create({
      data: {
        name: dto.name,
        ...(dto.customFieldsSchema !== undefined && {
          customFieldsSchema: dto.customFieldsSchema as Prisma.InputJsonValue,
        }),
      },
      include: { _count: { select: { assets: true } } },
    });

    log.info('Category created', { id: category.id, name: category.name });
    return successResponse(category, 'Category created', 'CREATED');
  }

  async findAll() {
    const categories = await this.prisma.assetCategory.findMany({
      include: { _count: { select: { assets: true } } },
      orderBy: { name: 'asc' },
    });
    return successResponse(categories, 'Categories fetched');
  }

  async findOne(id: string) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    return successResponse(category, 'Category fetched');
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.assetCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.name && dto.name !== category.name) {
      const conflict = await this.prisma.assetCategory.findUnique({
        where: { name: dto.name },
      });
      if (conflict) throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    const updated = await this.prisma.assetCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.customFieldsSchema !== undefined && {
          customFieldsSchema: dto.customFieldsSchema as Prisma.InputJsonValue,
        }),
      },
      include: { _count: { select: { assets: true } } },
    });

    log.info('Category updated', { id });
    return successResponse(updated, 'Category updated');
  }

  async remove(id: string) {
    const category = await this.prisma.assetCategory.findUnique({
      where: { id },
      include: { _count: { select: { assets: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');

    if (category._count.assets > 0) {
      throw new BadRequestException(
        `Cannot delete category: it has ${category._count.assets} asset(s) assigned`,
      );
    }

    await this.prisma.assetCategory.delete({ where: { id } });

    log.info('Category deleted', { id });
    return successResponse(null, 'Category deleted');
  }
}
