import { Controller, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AllocationService } from './allocation.service';
import { CreateAllocationDto } from './dto/create-allocation.dto';
import { ReturnAssetDto } from './dto/return-asset.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthRequest } from '../../utils/jwt.middleware';

@ApiTags('Allocations')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Allocate an asset to a user or department' })
  async allocate(@Body() createAllocationDto: CreateAllocationDto) {
    return this.allocationService.allocate(createAllocationDto);
  }

  @Post('asset/:assetId/transfer-request')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Request a transfer for an actively allocated asset' })
  async requestTransfer(
    @Param('assetId') assetId: string,
    @Req() req: AuthRequest,
  ) {
    return this.allocationService.requestTransfer(assetId, req.user.sub);
  }

  @Post(':id/approve-transfer')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
  @ApiOperation({ summary: 'Approve a transfer request' })
  async approveTransfer(@Param('id') id: string) {
    return this.allocationService.approveTransfer(id);
  }

  @Post(':id/return')
  @Roles(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Return an allocated asset' })
  async returnAsset(
    @Param('id') id: string,
    @Body() returnDto: ReturnAssetDto,
  ) {
    return this.allocationService.returnAsset(id, returnDto);
  }
}
