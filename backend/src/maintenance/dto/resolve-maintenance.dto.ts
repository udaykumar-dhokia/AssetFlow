import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveMaintenanceDto {
  @ApiProperty({ example: 'Replaced the LCD panel.' })
  @IsString()
  @IsNotEmpty()
  resolutionNotes: string;
}
