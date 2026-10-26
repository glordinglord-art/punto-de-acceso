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
    const { reply, messageId } = await this.agentService.processTrainerMessage(
      trainerId,
      dto.message,
    );
    return {
      success: true,
      data: { reply, messageId },
    };
  }

  @Post('apply-adjustment/:trainerId')
  @HttpCode(HttpStatus.OK)
  async applyAdjustment(
    @Param('trainerId') trainerId: string,
    @Body()
    dto: {
      clientName: string;
      oldExercise: string;
      newExercise: string;
      rationale?: string;
      routineName?: string;
    },
  ) {
    const result = await this.agentService.applyRoutineAdjustment(
      trainerId,
      dto,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Post('execute-action/:trainerId')
  @HttpCode(HttpStatus.OK)
  async executeAction(
    @Param('trainerId') trainerId: string,
    @Body() dto: Record<string, unknown>,
  ) {
    // messageId/actionIndex identifican el bloque del chat para marcarlo como
    // aplicado y que no se pueda aplicar dos veces al recargar
    const { messageId, actionIndex, ...action } = dto;
    const result = await this.agentService.executeRoutineAction(
      trainerId,
      action,
      {
        messageId: typeof messageId === 'string' ? messageId : undefined,
        actionIndex: typeof actionIndex === 'number' ? actionIndex : undefined,
      },
    );
    return {
      success: true,
      data: result,
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
