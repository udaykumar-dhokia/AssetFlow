import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AssetService } from './asset.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { SearchAssetDto } from './dto/search-asset.dto';
import { AuthRequest } from '../../utils/jwt.middleware';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Assets')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('assets')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER)
  @ApiOperation({ summary: 'Register a new asset' })
  async create(@Body() createAssetDto: CreateAssetDto, @Req() req: AuthRequest) {
    return this.assetService.create(createAssetDto, req.user.sub);
  }

  @Get()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Search and filter the asset directory' })
  async search(@Query() searchDto: SearchAssetDto) {
    return this.assetService.search(searchDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get details of a specific asset' })
  async findOne(@Param('id') id: string) {
    return this.assetService.findOne(id);
  }

  @Get(':id/history')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get unified allocation and maintenance history for an asset' })
  async getHistory(@Param('id') id: string) {
    return this.assetService.getHistory(id);
  }
}
