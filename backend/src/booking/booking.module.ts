import { Module, MiddlewareConsumer } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { SharedModule } from '../shared/shared.module';
import { JwtMiddleware } from '../../utils/jwt.middleware';

@Module({
  imports: [SharedModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(BookingController);
  }
}
