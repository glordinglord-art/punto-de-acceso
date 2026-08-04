import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import {
  ExerciseDictionaryRepositoryPort,
  ExerciseDictFilterParams,
  ExerciseDictPaginatedResult,
} from '../../../domain/ports/exercise-dictionary.repository.port';
import { ExerciseDictionary } from '../../../domain/entities/exercise-dictionary.entity';

@Injectable()
export class PrismaExerciseDictionaryRepository implements ExerciseDictionaryRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(record: any): ExerciseDictionary {
    return new ExerciseDictionary({
      id: record.id,
      name: record.name,
      muscleGroup: record.muscleGroup,
      videoUrl: record.videoUrl,
      equipment: record.equipment,
      category: record.category,
      target: record.target,
      gifUrl: record.gifUrl,
      imageUrl: record.imageUrl,
      instructionsEs: record.instructionsEs,
      instructionStepsEs: record.instructionStepsEs ?? [],
      secondaryMuscles: record.secondaryMuscles ?? [],
      attribution: record.attribution,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  private toData(exercise: ExerciseDictionary) {
    return {
      name: exercise.name,
      muscleGroup: exercise.muscleGroup as any,
      videoUrl: exercise.videoUrl,
      equipment: exercise.equipment,
      category: exercise.category,
      target: exercise.target,
      gifUrl: exercise.gifUrl,
      imageUrl: exercise.imageUrl,
      instructionsEs: exercise.instructionsEs,
      instructionStepsEs: exercise.instructionStepsEs,
      secondaryMuscles: exercise.secondaryMuscles,
      attribution: exercise.attribution,
    };
  }

  async save(exercise: ExerciseDictionary): Promise<ExerciseDictionary> {
    const data = this.toData(exercise);
    const record = await this.prisma.exerciseDictionary.upsert({
      where: { id: exercise.id },
      update: data,
      create: { id: exercise.id, ...data },
    });
    return this.toDomain(record);
  }

  async upsertByName(exercise: ExerciseDictionary): Promise<ExerciseDictionary> {
    const data = this.toData(exercise);
    const record = await this.prisma.exerciseDictionary.upsert({
      where: { name: exercise.name },
      update: data,
      create: { id: exercise.id, ...data },
    });
    return this.toDomain(record);
  }

  async findById(id: string): Promise<ExerciseDictionary | null> {
    const record = await this.prisma.exerciseDictionary.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  async findByName(name: string): Promise<ExerciseDictionary | null> {
    const record = await this.prisma.exerciseDictionary.findUnique({
      where: { name },
    });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<ExerciseDictionary[]> {
    const records = await this.prisma.exerciseDictionary.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findFiltered(
    filters: ExerciseDictFilterParams,
  ): Promise<ExerciseDictPaginatedResult> {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { target: { contains: filters.search, mode: 'insensitive' } },
        { equipment: { contains: filters.search, mode: 'insensitive' } },
        { instructionsEs: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.muscleGroup) {
      where.muscleGroup = filters.muscleGroup;
    }
    if (filters.equipment) {
      where.equipment = { contains: filters.equipment, mode: 'insensitive' };
    }
    if (filters.category) {
      where.category = { contains: filters.category, mode: 'insensitive' };
    }

    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [records, total] = await Promise.all([
      this.prisma.exerciseDictionary.findMany({
        where,
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.exerciseDictionary.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exerciseDictionary.delete({
      where: { id },
    });
  }
}
