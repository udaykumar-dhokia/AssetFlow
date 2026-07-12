import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignDepartmentDto {
  @ApiProperty({ example: 'uuid-of-department' })
  @IsUUID()
  departmentId: string;
}
