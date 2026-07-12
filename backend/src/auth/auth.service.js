var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, ConflictException, } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { OtpType } from '@prisma/client';
import { createLogger } from '../../utils/logger';
import { successResponse } from '../../utils/response';
const log = createLogger('AuthService');
const OTP_EXPIRY_MINUTES = {
    [OtpType.EMAIL_VERIFICATION]: 10,
    [OtpType.LOGIN]: 5,
    [OtpType.PASSWORD_RESET]: 15,
};
let AuthService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var AuthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        prisma;
        mail;
        constructor(prisma, mail) {
            this.prisma = prisma;
            this.mail = mail;
        }
        generateOtp() {
            return crypto.randomInt(100000, 999999).toString();
        }
        signJwt(userId, role) {
            return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' });
        }
        async createOtp(userId, type) {
            await this.prisma.otpToken.updateMany({
                where: { userId, type, used: false },
                data: { used: true },
            });
            const otp = this.generateOtp();
            const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES[type] * 60 * 1000);
            await this.prisma.otpToken.create({
                data: { userId, otp, type, expiresAt },
            });
            return otp;
        }
        async validateOtp(userId, otp, type) {
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
        async signup(dto) {
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
            await this.mail.sendOtpEmail(user.email, 'Verify your AssetFlow account', otp, `Welcome to AssetFlow, ${user.name}! Use the OTP below to verify your email address. It expires in ${OTP_EXPIRY_MINUTES[OtpType.EMAIL_VERIFICATION]} minutes.`);
            log.info('User registered', { userId: user.id, email: user.email });
            return successResponse({ email: user.email }, 'Account created. Check your email for the verification OTP.', 'CREATED');
        }
        async verifyEmail(dto) {
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
            return successResponse({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Email verified successfully');
        }
        async login(dto) {
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
            return successResponse({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
        }
        async requestLoginOtp(dto) {
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
            await this.mail.sendOtpEmail(user.email, 'Your AssetFlow login OTP', otp, `Use the OTP below to log in to your AssetFlow account. It expires in ${OTP_EXPIRY_MINUTES[OtpType.LOGIN]} minutes.`);
            log.info('Login OTP sent', { userId: user.id });
            return successResponse({ email: user.email }, 'OTP sent to your email');
        }
        async verifyLoginOtp(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            await this.validateOtp(user.id, dto.otp, OtpType.LOGIN);
            const token = this.signJwt(user.id, user.role);
            log.info('OTP login successful', { userId: user.id });
            return successResponse({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
        }
        async forgotPassword(dto) {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user) {
                throw new NotFoundException('User not found');
            }
            const otp = await this.createOtp(user.id, OtpType.PASSWORD_RESET);
            await this.mail.sendOtpEmail(user.email, 'Reset your AssetFlow password', otp, `Use the OTP below to reset your password. It expires in ${OTP_EXPIRY_MINUTES[OtpType.PASSWORD_RESET]} minutes. If you did not request this, please ignore this email.`);
            log.info('Password reset OTP sent', { userId: user.id });
            return successResponse({ email: user.email }, 'Password reset OTP sent to your email');
        }
        async resetPassword(dto) {
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
    };
    return AuthService = _classThis;
})();
export { AuthService };
