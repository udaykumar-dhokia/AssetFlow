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

/**
 * AuthService handles user registration, login, OTP generation and
 * password reset flows. It relies on Prisma for persistence, bcrypt for
 * password hashing, jsonwebtoken for JWT creation and a MailService for
 * sending OTP emails.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /**
   * Generates a 6‑digit numeric OTP.
   * @returns A string representation of the OTP.
   */
  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Creates a signed JWT containing the user id and role.
   * @param userId - The user's unique identifier.
   * @param role - The user's role.
   * @returns A signed JWT string.
   */
  private signJwt(userId: string, role: Role): string {
    return jwt.sign(
      { sub: userId, role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions,
    );
  }

  /**
   * Creates a new OTP record for the user and returns the OTP value.
   * Existing unused OTPs for the same user and type are marked as used.
   * @param userId - The user id.
   * @param type - The OTP type.
   * @returns The generated OTP string.
   */
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

  /**
   * Validates that the provided OTP is correct, unused and not expired.
   * Marks the OTP as used if validation succeeds.
   * @param userId - The user id.
   * @param otp - The OTP string to validate.
   * @param type - The OTP type.
   * @throws BadRequestException if the OTP is invalid or expired.
   */
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

  /**
   * Registers a new user and sends an email verification OTP.
   * @param dto - Signup data transfer object.
   * @returns A success response containing the user's email.
   */
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

  /**
   * Verifies a user's email using the provided OTP.
   * @param dto - Verification DTO.
   * @returns A success response containing a JWT and user info.
   */
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

  /**
   * Authenticates a user with email and password.
   * @param dto - Login DTO.
   * @returns A success response containing a JWT and user info.
   */
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

  /**
   * Sends a login OTP to the user.
   * @param dto - Request OTP DTO.
   * @returns A success response containing the user's email.
   */
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

  /**
   * Verifies the login OTP and returns a JWT.
   * @param dto - Verify OTP DTO.
   * @returns A success response containing a JWT and user info.
   */
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

  /**
   * Sends a password reset OTP to the user.
   * @param dto - Request OTP DTO.
   * @returns A success response containing the user's email.
   */
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

  /**
   * Resets the user's password after validating the OTP.
   * @param dto - Reset password DTO.
   * @returns A success response indicating completion.
   */
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
