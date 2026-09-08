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
    @Body() dto: Record<string, any>,
  ) {
    const result = await this.agentService.executeRoutineAction(
      trainerId,
      dto,
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
}
