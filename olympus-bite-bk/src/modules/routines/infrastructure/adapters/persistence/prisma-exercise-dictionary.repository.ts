import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { ExerciseDictionaryRepositoryPort } from '../../../domain/ports/exercise-dictionary.repository.port';
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
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async save(exercise: ExerciseDictionary): Promise<ExerciseDictionary> {
    const record = await this.prisma.exerciseDictionary.upsert({
      where: { id: exercise.id },
      update: {
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as any,
        videoUrl: exercise.videoUrl,
      },
      create: {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup as any,
        videoUrl: exercise.videoUrl,
      },
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

  async delete(id: string): Promise<void> {
    await this.prisma.exerciseDictionary.delete({
      where: { id },
    });
  }
}
