import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateRoutineUseCase } from '../../../application/use-cases/create-routine.use-case';
import { UpdateRoutineUseCase } from '../../../application/use-cases/update-routine.use-case';
import { SwapDaysUseCase } from '../../../application/use-cases/swap-days.use-case';
import { DeleteRoutineUseCase } from '../../../application/use-cases/delete-routine.use-case';
import { GetRoutinesByClientUseCase } from '../../../application/use-cases/get-routines-by-client.use-case';
import { LogWorkoutUseCase } from '../../../application/use-cases/log-workout.use-case';
import {
  EvaluateRoutineUseCase,
  EvaluateRoutineDto,
} from '../../../application/use-cases/evaluate-routine.use-case';
import { ActivateRoutineUseCase } from '../../../application/use-cases/activate-routine.use-case';
import {
  CreateRoutineDto,
  LogWorkoutDto,
  SwapDaysDto,
} from '../../../application/dtos/routine.dto';
import { RoutineResponseDto } from '../../../application/dtos/routine-response.dto';

@Controller('routines')
export class RoutinesController {
  constructor(
    private readonly createRoutineUseCase: CreateRoutineUseCase,
    private readonly updateRoutineUseCase: UpdateRoutineUseCase,
    private readonly swapDaysUseCase: SwapDaysUseCase,
    private readonly deleteRoutineUseCase: DeleteRoutineUseCase,
    private readonly getRoutinesByClientUseCase: GetRoutinesByClientUseCase,
    private readonly logWorkoutUseCase: LogWorkoutUseCase,
    private readonly evaluateRoutineUseCase: EvaluateRoutineUseCase,
    private readonly activateRoutineUseCase: ActivateRoutineUseCase,
  ) {}

  @Post(':trainerId')
  @HttpCode(HttpStatus.CREATED)
  async createRoutine(
    @Param('trainerId') trainerId: string,
    @Body() dto: CreateRoutineDto,
  ) {
    const routine = await this.createRoutineUseCase.execute(dto, trainerId);
    return { success: true, data: RoutineResponseDto.fromEntity(routine) };
  }

  @Get('client/:clientId')
  async getByClient(@Param('clientId') clientId: string) {
    const routines = await this.getRoutinesByClientUseCase.execute(clientId);
    return {
      success: true,
      data: routines.map(RoutineResponseDto.fromEntity),
    };
  }

  @Get('trainer/:trainerId')
  async getByTrainer(@Param('trainerId') trainerId: string) {
    const routines =
      await this.getRoutinesByClientUseCase.getByTrainer(trainerId);
    return {
      success: true,
      data: routines.map(RoutineResponseDto.fromEntity),
    };
  }

  @Put(':routineId')
  async updateRoutine(
    @Param('routineId') routineId: string,
    @Body() dto: CreateRoutineDto,
  ) {
    const routine = await this.updateRoutineUseCase.execute(routineId, dto);
    return { success: true, data: RoutineResponseDto.fromEntity(routine) };
  }

  @Delete(':routineId')
  @HttpCode(HttpStatus.OK)
  async deleteRoutine(@Param('routineId') routineId: string) {
    await this.deleteRoutineUseCase.execute(routineId);
    return { success: true, data: null };
  }

  @Put(':routineId/favorable')
  async evaluateFavorable(
    @Param('routineId') routineId: string,
    @Body() dto: EvaluateRoutineDto,
  ) {
    const routine = await this.evaluateRoutineUseCase.execute(routineId, dto);
    return { success: true, data: RoutineResponseDto.fromEntity(routine) };
  }

  @Put(':routineId/swap-days')
  async swapDays(
    @Param('routineId') routineId: string,
    @Body() dto: SwapDaysDto,
  ) {
    const routine = await this.swapDaysUseCase.execute(
      routineId,
      dto.dayNumberA,
      dto.dayNumberB,
    );
    return { success: true, data: RoutineResponseDto.fromEntity(routine) };
  }

  @Put(':routineId/activate')
  async activateRoutine(@Param('routineId') routineId: string) {
    const routine = await this.activateRoutineUseCase.execute(routineId);
    return { success: true, data: RoutineResponseDto.fromEntity(routine) };
  }

  // ─── Workout Logs (Registro) ─────────────────────────────

  @Post(':routineId/log/:userId')
  @HttpCode(HttpStatus.CREATED)
  async logWorkout(
    @Param('userId') userId: string,
    @Body() dto: LogWorkoutDto,
  ) {
    const log = await this.logWorkoutUseCase.execute(dto, userId);
    return { success: true, data: log };
  }

  @Delete(':routineId/log/:userId/:exerciseId/:weekNumber')
  @HttpCode(HttpStatus.OK)
  async unlogWorkout(
    @Param('userId') userId: string,
    @Param('exerciseId') exerciseId: string,
    @Param('weekNumber') weekNumber: string,
  ) {
    await this.logWorkoutUseCase.unlog(
      exerciseId,
      userId,
      parseInt(weekNumber, 10),
    );
    return { success: true, data: null };
  }

  @Get(':routineId/logs/:userId')
  async getLogs(
    @Param('routineId') routineId: string,
    @Param('userId') userId: string,
  ) {
    const logs = await this.logWorkoutUseCase.getByRoutine(routineId, userId);
    return { success: true, data: logs };
  }
}
