import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { TASK_REPOSITORY, TaskRepositoryPort } from '../../../domain/ports/task.repository.port';
import { CreateTaskDto, UpdateTaskDto, ToggleTaskLogDto } from '../../../application/dtos/task.dto';

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: TaskRepositoryPort,
  ) {}

  /* ─── Tasks CRUD ─────────────────────────── */

  @Post(':userId')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('userId') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.taskRepo.createTask(
      userId,
      dto.title,
      dto.icon ?? '✅',
      dto.order ?? 0,
    );
    return { success: true, data: task };
  }

  @Get(':userId')
  async getTasks(@Param('userId') userId: string) {
    const tasks = await this.taskRepo.getTasksByUser(userId);
    return { success: true, data: tasks };
  }

  @Put(':taskId')
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskRepo.updateTask(taskId, dto);
    return { success: true, data: task };
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.OK)
  async deleteTask(@Param('taskId') taskId: string) {
    await this.taskRepo.deleteTask(taskId);
    return { success: true, data: null };
  }

  /* ─── Task Logs ──────────────────────────── */

  @Post(':taskId/toggle/:userId')
  @HttpCode(HttpStatus.OK)
  async toggleLog(
    @Param('taskId') taskId: string,
    @Param('userId') userId: string,
    @Body() dto: ToggleTaskLogDto,
  ) {
    const log = await this.taskRepo.toggleLog(taskId, userId, dto.date);
    return { success: true, data: log };
  }

  @Get(':userId/logs')
  async getLogs(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const logs = await this.taskRepo.getLogsByUserAndDateRange(userId, start, end);
    return { success: true, data: logs };
  }

  @Get(':userId/logs/:date')
  async getLogsByDate(
    @Param('userId') userId: string,
    @Param('date') date: string,
  ) {
    const logs = await this.taskRepo.getLogsByDate(userId, date);
    return { success: true, data: logs };
  }
}
