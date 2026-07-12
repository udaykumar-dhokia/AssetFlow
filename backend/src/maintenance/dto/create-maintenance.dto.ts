import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'uuid-of-asset' })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({ example: 'Screen flickering continuously' })
  @IsString()
  @IsNotEmpty()
  issueDescription: string;

  @ApiProperty({ enum: Priority, default: Priority.LOW })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.LOW;

  @ApiPropertyOptional({ example: 'https://example.com/screen.jpg' })
  @IsString()
  @IsOptional()
  photoUrl?: string;
}
