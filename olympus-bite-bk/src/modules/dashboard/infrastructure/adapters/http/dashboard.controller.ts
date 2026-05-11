import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/get-dashboard-stats.use-case';
import { GetClientDashboardUseCase } from '../../../application/use-cases/get-client-dashboard.use-case';
import { UpdateWaterLogUseCase } from '../../../application/use-cases/update-water-log.use-case';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly getClientDashboardUseCase: GetClientDashboardUseCase,
    private readonly updateWaterLogUseCase: UpdateWaterLogUseCase,
  ) {}

  @Post('client/:clientId/water')
  async updateWater(
    @Param('clientId') clientId: string,
    @Body('date') date: string,
    @Body('amount') amount: number,
  ) {
    const log = await this.updateWaterLogUseCase.execute(
      clientId,
      date,
      amount,
    );
    return { success: true, data: log };
  }

  @Get('client/:clientId')
  async getClientDashboard(
    @Param('clientId') clientId: string,
    @Query('tz') tz?: string,
  ) {
    const tzOffset = tz ? parseInt(tz, 10) : 0;
    const stats = await this.getClientDashboardUseCase.execute(
      clientId,
      isNaN(tzOffset) ? 0 : tzOffset,
    );
    return { success: true, data: stats };
  }

  @Get(':trainerId')
  async getStats(
    @Param('trainerId') trainerId: string,
    @Query('tz') tz?: string,
  ) {
    const tzOffset = tz ? parseInt(tz, 10) : 0;
    const stats = await this.getDashboardStatsUseCase.execute(
      trainerId,
      isNaN(tzOffset) ? 0 : tzOffset,
    );
    return { success: true, data: stats };
  }
}
