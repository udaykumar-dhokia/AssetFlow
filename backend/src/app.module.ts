import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { OrganizationModule } from './organization/organization.module';
import { JwtMiddleware } from '../utils/jwt.middleware';
import { AssetModule } from './asset/asset.module';
import { AllocationModule } from './allocation/allocation.module';
import { BookingModule } from './booking/booking.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { NotificationModule } from './notification/notification.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    DashboardModule,
    OrganizationModule,
    AssetModule,
    AllocationModule,
    BookingModule,
    ScheduleModule.forRoot(),
    MaintenanceModule,
    NotificationModule,
    ActivityLogModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes('*');
  }
}
