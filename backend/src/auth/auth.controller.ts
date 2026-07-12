import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user and send email verification OTP' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address using the OTP sent on signup' })
  verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login-otp/request')
  @ApiOperation({ summary: 'Request a one-time OTP for passwordless login (verified users only)' })
  requestLoginOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post('login-otp/verify')
  @ApiOperation({ summary: 'Verify login OTP and receive JWT token' })
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Send a password reset OTP to the registered email' })
  forgotPassword(@Body() dto: RequestOtpDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using the OTP received via email' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
