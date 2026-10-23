import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClinicalAgentService } from '../../../application/services/clinical-agent.service';

@Controller('clinical-agent')
export class ClinicalAgentController {
  constructor(private readonly agentService: ClinicalAgentService) {}

  @Post('chat/:trainerId')
  @HttpCode(HttpStatus.OK)
  async chat(
    @Param('trainerId') trainerId: string,
    @Body() dto: { message: string },
  ) {
    const reply = await this.agentService.processTrainerMessage(
      trainerId,
      dto.message,
    );
    return {
      success: true,
      data: { reply },
    };
  }

  @Get('history/:trainerId')
  async getHistory(@Param('trainerId') trainerId: string) {
    const history = await this.agentService.getChatHistory(trainerId);
    return {
      success: true,
      data: history,
    };
  }

  @Delete('history/:trainerId')
  @HttpCode(HttpStatus.OK)
  async clearHistory(@Param('trainerId') trainerId: string) {
    await this.agentService.clearChatHistory(trainerId);
    return {
      success: true,
      data: null,
    };
  }

  @Post('athlete/:athleteId/chat')
  @HttpCode(HttpStatus.OK)
  async chatAthleteCase(
    @Param('athleteId') athleteId: string,
    @Body()
    dto: {
      trainerId?: string;
      message: string;
      trainerPrivateNotes?: string;
    },
  ) {
    const res = await this.agentService.processAthleteCaseMessage(
      athleteId,
      dto.message,
      dto.trainerPrivateNotes,
    );
    return {
      success: true,
      data: res,
    };
  }

  @Get('athlete/:athleteId/history')
  async getAthleteCaseHistory(@Param('athleteId') athleteId: string) {
    const res = await this.agentService.getAthleteCaseHistory(athleteId);
    return {
      success: true,
      data: res,
    };
  }

  @Delete('athlete/:athleteId/history')
  @HttpCode(HttpStatus.OK)
  async clearAthleteCaseHistory(@Param('athleteId') athleteId: string) {
    await this.agentService.clearAthleteCaseHistory(athleteId);
    return {
      success: true,
      data: null,
    };
  }
}
