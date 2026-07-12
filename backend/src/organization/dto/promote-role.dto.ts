import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class PromoteRoleDto {
  @ApiProperty({
    enum: [Role.EMPLOYEE, Role.DEPT_HEAD, Role.ASSET_MANAGER, Role.ADMIN],
    example: Role.DEPT_HEAD,
    description: 'New role to assign to the employee',
  })
  @IsEnum(Role)
  role: Role;
}
