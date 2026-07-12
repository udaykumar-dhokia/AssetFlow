import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditDto {
  @ApiProperty({ example: 'Q3 IT Equipment Audit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'dept-uuid' })
  @IsString()
  @IsOptional()
  scopeDepartmentId?: string;

  @ApiPropertyOptional({ example: 'London Office' })
  @IsString()
  @IsOptional()
  scopeLocation?: string;

  @ApiProperty({ example: '2024-10-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2024-10-15T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ type: [String], example: ['auditor-uuid-1'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  auditorIds: string[];
}
