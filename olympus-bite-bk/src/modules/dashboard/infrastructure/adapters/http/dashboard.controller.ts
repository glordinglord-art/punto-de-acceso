import { Controller, Get, Param } from '@nestjs/common';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/get-dashboard-stats.use-case';
import { GetClientDashboardUseCase } from '../../../application/use-cases/get-client-dashboard.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getClientDashboardUseCase: GetClientDashboardUseCase,
  ) {}

  @Get('client/:clientId')
  async getClientDashboard(@Param('clientId') clientId: string) {
    const stats = await this.getClientDashboardUseCase.execute(clientId);
    return { success: true, data: stats };
  }

  @Get(':trainerId')
  async getStats(@Param('trainerId') trainerId: string) {
    const stats = await this.getDashboardStatsUseCase.execute(trainerId);
    return { success: true, data: stats };
  }
}
