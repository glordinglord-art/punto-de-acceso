import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateDictExerciseUseCase } from '../../../application/use-cases/create-dict-exercise.use-case';
import { GetDictExercisesUseCase } from '../../../application/use-cases/get-dict-exercises.use-case';
import { DeleteDictExerciseUseCase } from '../../../application/use-cases/delete-dict-exercise.use-case';
import { SearchDictExercisesUseCase } from '../../../application/use-cases/search-dict-exercises.use-case';
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
    private readonly searchDictExercisesUseCase: SearchDictExercisesUseCase,
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

  @Get('search')
  async search(
    @Query('q') q?: string,
    @Query('muscle') muscle?: string,
    @Query('equipment') equipment?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.searchDictExercisesUseCase.execute({
      search: q,
      muscleGroup: muscle,
      equipment,
      category,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: result.data.map((ex) => ExerciseDictResponseDto.fromEntity(ex)),
      total: result.total,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
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
