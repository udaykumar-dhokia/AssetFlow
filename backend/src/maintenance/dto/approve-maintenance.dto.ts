import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveMaintenanceDto {
  @ApiPropertyOptional({ example: 'John IT Dept', description: 'Can optionally assign a technician immediately upon approval' })
  @IsString()
  @IsOptional()
  technicianName?: string;
}
