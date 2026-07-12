import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRequest } from '../../../utils/jwt.middleware';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;
    
    if (!user || !user.sub) {
      return false;
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.sub },
      select: { role: true }
    });

    return userRoles.some((ur) => requiredRoles.includes(ur.role));
  }
}
