import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectMaintenanceDto {
  @ApiProperty({ example: 'Please try restarting the laptop first', description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
