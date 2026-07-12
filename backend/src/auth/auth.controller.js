var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
let AuthController = (() => {
    let _classDecorators = [ApiTags('Auth'), Controller('auth')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _instanceExtraInitializers = [];
    let _signup_decorators;
    let _verifyEmail_decorators;
    let _login_decorators;
    let _requestLoginOtp_decorators;
    let _verifyLoginOtp_decorators;
    let _forgotPassword_decorators;
    let _resetPassword_decorators;
    var AuthController = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _signup_decorators = [Post('signup'), ApiOperation({ summary: 'Register a new user and send email verification OTP' })];
            _verifyEmail_decorators = [Post('verify-email'), ApiOperation({ summary: 'Verify email address using the OTP sent on signup' })];
            _login_decorators = [Post('login'), ApiOperation({ summary: 'Login with email and password' })];
            _requestLoginOtp_decorators = [Post('login-otp/request'), ApiOperation({ summary: 'Request a one-time OTP for passwordless login (verified users only)' })];
            _verifyLoginOtp_decorators = [Post('login-otp/verify'), ApiOperation({ summary: 'Verify login OTP and receive JWT token' })];
            _forgotPassword_decorators = [Post('forgot-password'), ApiOperation({ summary: 'Send a password reset OTP to the registered email' })];
            _resetPassword_decorators = [Post('reset-password'), ApiOperation({ summary: 'Reset password using the OTP received via email' })];
            __esDecorate(this, null, _signup_decorators, { kind: "method", name: "signup", static: false, private: false, access: { has: obj => "signup" in obj, get: obj => obj.signup }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyEmail_decorators, { kind: "method", name: "verifyEmail", static: false, private: false, access: { has: obj => "verifyEmail" in obj, get: obj => obj.verifyEmail }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _login_decorators, { kind: "method", name: "login", static: false, private: false, access: { has: obj => "login" in obj, get: obj => obj.login }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _requestLoginOtp_decorators, { kind: "method", name: "requestLoginOtp", static: false, private: false, access: { has: obj => "requestLoginOtp" in obj, get: obj => obj.requestLoginOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _verifyLoginOtp_decorators, { kind: "method", name: "verifyLoginOtp", static: false, private: false, access: { has: obj => "verifyLoginOtp" in obj, get: obj => obj.verifyLoginOtp }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _forgotPassword_decorators, { kind: "method", name: "forgotPassword", static: false, private: false, access: { has: obj => "forgotPassword" in obj, get: obj => obj.forgotPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _resetPassword_decorators, { kind: "method", name: "resetPassword", static: false, private: false, access: { has: obj => "resetPassword" in obj, get: obj => obj.resetPassword }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            AuthController = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        authService = __runInitializers(this, _instanceExtraInitializers);
        constructor(authService) {
            this.authService = authService;
        }
        signup(dto) {
            return this.authService.signup(dto);
        }
        verifyEmail(dto) {
            return this.authService.verifyEmail(dto);
        }
        login(dto) {
            return this.authService.login(dto);
        }
        requestLoginOtp(dto) {
            return this.authService.requestLoginOtp(dto);
        }
        verifyLoginOtp(dto) {
            return this.authService.verifyLoginOtp(dto);
        }
        forgotPassword(dto) {
            return this.authService.forgotPassword(dto);
        }
        resetPassword(dto) {
            return this.authService.resetPassword(dto);
        }
    };
    return AuthController = _classThis;
})();
export { AuthController };
