import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateStatusDto {
  @ApiProperty({ enum: Status, example: Status.ACTIVE })
  @IsEnum(Status)
  status: Status;
}
