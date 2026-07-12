import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NewStrongPass@456', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
