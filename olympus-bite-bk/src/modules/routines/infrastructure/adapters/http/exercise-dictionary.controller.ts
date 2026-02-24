import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateDictExerciseUseCase } from '../../../application/use-cases/create-dict-exercise.use-case';
import { GetDictExercisesUseCase } from '../../../application/use-cases/get-dict-exercises.use-case';
import { DeleteDictExerciseUseCase } from '../../../application/use-cases/delete-dict-exercise.use-case';
import {
  CreateExerciseDictDto,
  ExerciseDictResponseDto,
} from '../../../application/dtos/exercise-dictionary.dto';

@Controller('exercise-dictionary')
export class ExerciseDictionaryController {
  constructor(
    private readonly createDictExerciseUseCase: CreateDictExerciseUseCase,
    private readonly getDictExercisesUseCase: GetDictExercisesUseCase,
    private readonly deleteDictExerciseUseCase: DeleteDictExerciseUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateExerciseDictDto) {
    const created = await this.createDictExerciseUseCase.execute(dto);
    return {
      success: true,
      data: ExerciseDictResponseDto.fromEntity(created),
    };
  }

  @Get()
  async getAll() {
    const exercises = await this.getDictExercisesUseCase.execute();
    return {
      success: true,
      data: exercises.map((ex) => ExerciseDictResponseDto.fromEntity(ex)),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.deleteDictExerciseUseCase.execute(id);
    return {
      success: true,
      message: 'Ejercicio eliminado del diccionario correctamente',
    };
  }
}
