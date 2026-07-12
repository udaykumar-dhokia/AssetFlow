import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AssetModule } from './asset/asset.module';

@Module({
  imports: [SharedModule, AuthModule, DashboardModule, AssetModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
