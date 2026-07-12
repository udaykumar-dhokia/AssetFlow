import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReturnAssetDto {
  @ApiPropertyOptional({ example: 'Screen has a small scratch on the top left', description: 'Notes about the asset condition upon return' })
  @IsString()
  @IsOptional()
  returnConditionNotes?: string;
}
