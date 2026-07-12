import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditItemStatus } from '@prisma/client';

export class AuditItemDto {
  @ApiProperty({ example: 'asset-uuid' })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({ enum: AuditItemStatus, example: 'VERIFIED' })
  @IsEnum(AuditItemStatus)
  @IsNotEmpty()
  status: AuditItemStatus;

  @ApiPropertyOptional({ example: 'Screen has a minor scratch.' })
  @IsString()
  @IsOptional()
  notes?: string;
}
