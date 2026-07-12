import { IsString, IsNotEmpty, IsOptional, IsDateString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAllocationDto {
  @ApiProperty({ example: 'uuid-of-asset' })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiPropertyOptional({ example: 'uuid-of-user', description: 'User ID to allocate to (Must provide either userId or departmentId)' })
  @ValidateIf(o => !o.allocatedToDepartmentId)
  @IsString()
  @IsNotEmpty()
  allocatedToUserId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-department', description: 'Department ID to allocate to' })
  @ValidateIf(o => !o.allocatedToUserId)
  @IsString()
  @IsNotEmpty()
  allocatedToDepartmentId?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  expectedReturnDate?: string;
}
