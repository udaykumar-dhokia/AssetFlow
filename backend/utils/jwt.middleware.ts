import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { createLogger } from './logger';
import { PrismaService } from '../src/shared/prisma.service';

const log = createLogger('JwtMiddleware');

export interface JwtPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const url = req.originalUrl || req.url || req.path;
    log.info('JWT middleware hit', { path: req.path, originalUrl: req.originalUrl, url: req.url });

    if (url.startsWith('/auth')) {
      log.info('Skipping JWT for public auth route', { url });
      return next();
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      req.user = payload;
      log.info('Authenticated user', { userId: payload.sub, role: payload.role });
      next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        log.warn('Token expired', { token: token.slice(0, 20) });
        throw new UnauthorizedException('Token has expired');
      }
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      log.warn('Invalid token', { error: (err as Error).message });
      throw new UnauthorizedException('Invalid token');
    }
  }
}
