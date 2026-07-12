import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTechnicianDto {
  @ApiProperty({ example: 'Dell Service Center' })
  @IsString()
  @IsNotEmpty()
  technicianName: string;
}
