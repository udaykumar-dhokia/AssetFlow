import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'uuid-of-parent-department',
    required: false,
    nullable: true,
    description: 'Leave out or set to null if this is a top-level department',
  })
  @IsOptional()
  @ValidateIf((o) => o.parentDepartmentId != null && o.parentDepartmentId !== '')
  @IsUUID()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  parentDepartmentId?: string;

  @ApiProperty({
    example: 'uuid-of-head-user',
    required: false,
    nullable: true,
    description: 'Leave out or set to null if no head user yet',
  })
  @IsOptional()
  @ValidateIf((o) => o.headUserId != null && o.headUserId !== '')
  @IsUUID()
  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  headUserId?: string;
}
