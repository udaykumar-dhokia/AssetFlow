import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';
import { SharedModule } from '../shared/shared.module';
import { JwtMiddleware } from '../../utils/jwt.middleware';

@Module({
  imports: [SharedModule],
  controllers: [AllocationController],
  providers: [AllocationService],
})
export class AllocationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(AllocationController);
  }
}
