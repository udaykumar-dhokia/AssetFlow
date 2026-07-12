import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { SharedModule } from '../shared/shared.module';
import { JwtMiddleware } from '../../utils/jwt.middleware';

@Module({
  imports: [SharedModule],
  controllers: [AuditController],
  providers: [AuditService],
})
export class AuditModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(AuditController);
  }
}
