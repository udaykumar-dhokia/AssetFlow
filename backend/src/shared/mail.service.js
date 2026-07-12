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
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { createLogger } from '../../utils/logger';
const log = createLogger('MailService');
let MailService = (() => {
    let _classDecorators = [Injectable()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var MailService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MailService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        createTransport() {
            const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'https://developers.google.com/oauthplayground');
            oAuth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            });
            return nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.GMAIL_FROM,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                },
            });
        }
        async sendOtpEmail(to, subject, otp, body) {
            const transport = this.createTransport();
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1f2937; margin-bottom: 8px;">AssetFlow</h2>
        <p style="color: #4b5563; font-size: 15px;">${body}</p>
        <div style="margin: 24px 0; text-align: center;">
          <span style="display: inline-block; background: #1f2937; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px;">This OTP is valid for a limited time. Do not share it with anyone.</p>
      </div>
    `;
            try {
                await transport.sendMail({
                    from: `"AssetFlow" <${process.env.GMAIL_FROM}>`,
                    to,
                    subject,
                    html,
                });
                log.info(`OTP email sent to ${to}`);
            }
            catch (error) {
                log.error(`Failed to send OTP email to ${to}`, error);
                throw error;
            }
        }
    };
    return MailService = _classThis;
})();
export { MailService };
