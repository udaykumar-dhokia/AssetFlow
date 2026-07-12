import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';
import { Prisma } from '@prisma/client';

/**
 * AssetService provides CRUD and search operations for assets. It also
 * manages the asset tag sequence used for generating unique asset tags.
 */
@Injectable()
export class AssetService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.prisma.$executeRawUnsafe(
      'CREATE SEQUENCE IF NOT EXISTS asset_tag_seq START 1;'
    );
  }

  /**
   * Creates a new asset and assigns a unique asset tag.
   * @param dto - Asset creation DTO.
   * @returns The created asset including its category.
   */
  async create(dto: CreateAssetDto) {
    const result = await this.prisma.$queryRaw<{ nextval: bigint }[]>`SELECT nextval('asset_tag_seq')`;
    const nextVal = Number(result[0].nextval);
    const assetTag = `AF-${nextVal.toString().padStart(4, '0')}`;

    return this.prisma.asset.create({
      data: {
        ...dto,
        assetTag,
        acquisitionDate: dto.acquisitionDate ? new Date(dto.acquisitionDate) : null,
      },
      include: {
        category: true,
      }
    });
  }

  /**
   * Searches for assets based on various filters.
   * @param dto - Search parameters.
   * @returns An object containing total count and the matching assets.
   */
  async search(dto: SearchAssetDto) {
    const { search, categoryId, status, location, departmentId, skip, take } = dto;

    const where: Prisma.AssetWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { assetTag: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (location) where.location = { contains: location, mode: 'insensitive' };

    if (departmentId) {
      where.allocations = {
        some: {
          status: 'ACTIVE',
          OR: [
            { allocatedToDepartmentId: departmentId },
            {
              allocatedToUser: {
                departmentId: departmentId,
              },
            },
          ],
        },
      };
    }

    const [total, assets] = await this.prisma.$transaction([
      this.prisma.asset.count({ where }),
      this.prisma.asset.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, assets };
  }

  /**
   * Retrieves a single asset by id.
   * @param id - Asset identifier.
   * @returns The asset with its category.
   * @throws NotFoundException if the asset does not exist.
   */
  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  /**
   * Returns the allocation and maintenance history for an asset.
   * @param id - Asset identifier.
   * @returns An array of history entries sorted by date descending.
   * @throws NotFoundException if the asset does not exist.
   */
  async getHistory(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        allocations: {
          include: {
            allocatedToUser: { select: { id: true, name: true, email: true } },
            allocatedToDept: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        maintenanceReqs: {
          include: {
            requestedBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    const history = [
      ...asset.allocations.map(a => ({ type: 'ALLOCATION', date: a.createdAt, data: a })),
      ...asset.maintenanceReqs.map(m => ({ type: 'MAINTENANCE', date: m.createdAt, data: m })),
    ];

    history.sort((a, b) => b.date.getTime() - a.date.getTime());

    return history;
  }
}
