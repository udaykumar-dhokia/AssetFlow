import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { OtpType, Role } from '@prisma/client';
import { PrismaService } from '../shared/prisma.service';
import { MailService } from '../shared/mail.service';
import { createLogger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const log = createLogger('AuthService');

const OTP_EXPIRY_MINUTES = {
  [OtpType.EMAIL_VERIFICATION]: 10,
  [OtpType.LOGIN]: 5,
  [OtpType.PASSWORD_RESET]: 15,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private signJwt(userId: string, role: Role): string {
    return jwt.sign(
      { sub: userId, role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
    );
  }

  private async createOtp(userId: string, type: OtpType): Promise<string> {
    await this.prisma.otpToken.updateMany({
      where: { userId, type, used: false },
      data: { used: true },
    });

    const otp = this.generateOtp();
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES[type] * 60 * 1000,
    );

    await this.prisma.otpToken.create({
      data: { userId, otp, type, expiresAt },
    });

    return otp;
  }

  private async validateOtp(
    userId: string,
    otp: string,
    type: OtpType,
  ): Promise<void> {
    const record = await this.prisma.otpToken.findFirst({
      where: { userId, otp, type, used: false },
    });

    if (!record) {
      throw new BadRequestException('Invalid OTP');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.prisma.otpToken.update({
      where: { id: record.id },
      data: { used: true },
    });
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
      },
    });

    const otp = await this.createOtp(user.id, OtpType.EMAIL_VERIFICATION);

    await this.mail.sendOtpEmail(
      user.email,
      'Verify your AssetFlow account',
      otp,
      `Welcome to AssetFlow, ${user.name}! Use the OTP below to verify your email address. It expires in ${OTP_EXPIRY_MINUTES[OtpType.EMAIL_VERIFICATION]} minutes.`,
    );

    log.info('User registered', { userId: user.id, email: user.email });

    return successResponse(
      { email: user.email },
      'Account created. Check your email for the verification OTP.',
      'CREATED',
    );
  }

  async verifyEmail(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    await this.validateOtp(user.id, dto.otp, OtpType.EMAIL_VERIFICATION);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    const token = this.signJwt(user.id, user.role);

    log.info('Email verified', { userId: user.id });

    return successResponse(
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      'Email verified successfully',
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signJwt(user.id, user.role);

    log.info('User logged in', { userId: user.id });

    return successResponse(
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      'Login successful',
    );
  }

  async requestLoginOtp(dto: RequestOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const otp = await this.createOtp(user.id, OtpType.LOGIN);

    await this.mail.sendOtpEmail(
      user.email,
      'Your AssetFlow login OTP',
      otp,
      `Use the OTP below to log in to your AssetFlow account. It expires in ${OTP_EXPIRY_MINUTES[OtpType.LOGIN]} minutes.`,
    );

    log.info('Login OTP sent', { userId: user.id });

    return successResponse(
      { email: user.email },
      'OTP sent to your email',
    );
  }

  async verifyLoginOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.validateOtp(user.id, dto.otp, OtpType.LOGIN);

    const token = this.signJwt(user.id, user.role);

    log.info('OTP login successful', { userId: user.id });

    return successResponse(
      { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      'Login successful',
    );
  }

  async forgotPassword(dto: RequestOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.createOtp(user.id, OtpType.PASSWORD_RESET);

    await this.mail.sendOtpEmail(
      user.email,
      'Reset your AssetFlow password',
      otp,
      `Use the OTP below to reset your password. It expires in ${OTP_EXPIRY_MINUTES[OtpType.PASSWORD_RESET]} minutes. If you did not request this, please ignore this email.`,
    );

    log.info('Password reset OTP sent', { userId: user.id });

    return successResponse(
      { email: user.email },
      'Password reset OTP sent to your email',
    );
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.validateOtp(user.id, dto.otp, OtpType.PASSWORD_RESET);

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    log.info('Password reset successful', { userId: user.id });

    return successResponse(null, 'Password reset successfully');
  }
}
