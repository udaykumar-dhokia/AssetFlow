import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Engineering', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'uuid-of-parent-department',
    required: false,
    nullable: true,
    description: 'Send null to remove the parent department',
  })
  @IsOptional()
  @ValidateIf((o) => o.parentDepartmentId != null && o.parentDepartmentId !== '')
  @IsUUID()
  @Transform(({ value }) => (value === '' ? null : value))
  parentDepartmentId?: string | null;

  @ApiProperty({
    example: 'uuid-of-head-user',
    required: false,
    nullable: true,
    description: 'Send null to remove the head user',
  })
  @IsOptional()
  @ValidateIf((o) => o.headUserId != null && o.headUserId !== '')
  @IsUUID()
  @Transform(({ value }) => (value === '' ? null : value))
  headUserId?: string | null;
}
