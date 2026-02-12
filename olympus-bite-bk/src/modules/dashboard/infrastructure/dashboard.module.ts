import { Module } from '@nestjs/common';
import { DashboardController } from './adapters/http/dashboard.controller';
import { GetDashboardStatsUseCase } from '../application/use-cases/get-dashboard-stats.use-case';
import { GetClientDashboardUseCase } from '../application/use-cases/get-client-dashboard.use-case';

@Module({
  controllers: [DashboardController],
  providers: [GetDashboardStatsUseCase, GetClientDashboardUseCase],
})
export class DashboardModule {}
