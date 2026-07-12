import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  name: string;

  @ApiProperty({
    required: false,
    example: { warrantyPeriodMonths: 'number', brand: 'string' },
    description: 'JSON schema defining extra fields for assets in this category',
  })
  @IsOptional()
  @IsObject()
  customFieldsSchema?: Record<string, unknown>;
}
