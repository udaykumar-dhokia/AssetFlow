import {
  Body,
  Controller,
  Delete,
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
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('Organization - Categories')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('organization/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Create a new asset category' })
  create(@Body() dto: CreateCategoryDto, @Req() req: AuthRequest) {
    return this.categoryService.create(dto, req.user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'List all asset categories' })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get a single asset category with asset count' })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Update category name or custom fields schema' })
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @Req() req: AuthRequest) {
    return this.categoryService.update(id, dto, req.user.sub);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a category (only if no assets are assigned)' })
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.categoryService.remove(id, req.user.sub);
  }
}
