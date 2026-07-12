import { IsString, IsNotEmpty, IsOptional, IsDateString, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDto {
  @ApiProperty({ example: 'MacBook Pro M3' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'uuid-of-category' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: 'C02ZG123MD6R' })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsDateString()
  @IsOptional()
  acquisitionDate?: string;

  @ApiPropertyOptional({ example: 2500.00 })
  @IsNumber()
  @IsOptional()
  acquisitionCost?: number;

  @ApiPropertyOptional({ example: 'Excellent' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ example: 'HQ - Floor 3' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isSharedBookable?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customAttributes?: Record<string, any>;
}
