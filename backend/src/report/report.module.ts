import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SharedModule } from '../shared/shared.module';
import { JwtMiddleware } from '../../utils/jwt.middleware';

@Module({
  imports: [SharedModule],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(ReportController);
  }
}
