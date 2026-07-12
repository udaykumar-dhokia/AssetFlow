import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { SharedModule } from '../shared/shared.module';
import { JwtMiddleware } from '../../utils/jwt.middleware';

@Module({
  imports: [SharedModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(AssetController);
  }
}
