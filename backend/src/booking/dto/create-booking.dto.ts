import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-asset' })
  @IsString()
  @IsNotEmpty()
  assetId: string;

  @ApiProperty({ example: '2024-12-01T09:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2024-12-01T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
