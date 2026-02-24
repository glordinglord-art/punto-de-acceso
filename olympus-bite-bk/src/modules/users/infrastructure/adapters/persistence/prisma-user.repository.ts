import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';
import { User, CreateUserProps } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import type { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: PrismaUser): User {
    const user = new User(
      {
        email: raw.email,
        name: raw.name,
        password: raw.password,
        role: raw.role as unknown as UserRole,
        avatarUrl: raw.avatarUrl ?? undefined,
        phone: raw.phone ?? undefined,
        dietaryGoal: raw.dietaryGoal ?? undefined,
        weight: raw.weight ?? undefined,
        height: raw.height ?? undefined,
        targetCalories: raw.targetCalories ?? undefined,
        onboardingCompleted: raw.onboardingCompleted,
        experienceLevel: raw.experienceLevel ?? undefined,
        equipmentAccess: raw.equipmentAccess ?? undefined,
        medicalConditions: raw.medicalConditions ?? undefined,
        dietaryPreferences: raw.dietaryPreferences ?? undefined,
      },
      raw.id,
    );
    user.isActive = raw.isActive;
    (user as any).createdAt = raw.createdAt;
    (user as any).updatedAt = raw.updatedAt;
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany();
    return rows.map((r) => this.toDomain(r));
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    return raw ? this.toDomain(raw) : null;
  }

  async findByTrainerId(trainerId: string): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ where: { trainerId } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(entity: User): Promise<User> {
    const raw = await this.prisma.user.create({
      data: {
        id: entity.id,
        email: entity.email,
        name: entity.name,
        password: entity.password,
        role: entity.role as string as any,
        avatarUrl: entity.avatarUrl,
        phone: entity.phone,
        dietaryGoal: entity.dietaryGoal,
        weight: entity.weight,
        height: entity.height,
        targetCalories: entity.targetCalories,
        onboardingCompleted: entity.onboardingCompleted,
        experienceLevel: entity.experienceLevel,
        equipmentAccess: entity.equipmentAccess,
        medicalConditions: entity.medicalConditions,
        dietaryPreferences: entity.dietaryPreferences,
        isActive: entity.isActive,
      },
    });
    return this.toDomain(raw);
  }

  async update(entity: User): Promise<User> {
    const raw = await this.prisma.user.update({
      where: { id: entity.id },
      data: {
        email: entity.email,
        name: entity.name,
        password: entity.password,
        role: entity.role as string as any,
        avatarUrl: entity.avatarUrl,
        phone: entity.phone,
        dietaryGoal: entity.dietaryGoal,
        weight: entity.weight,
        height: entity.height,
        targetCalories: entity.targetCalories,
        onboardingCompleted: entity.onboardingCompleted,
        experienceLevel: entity.experienceLevel,
        equipmentAccess: entity.equipmentAccess,
        medicalConditions: entity.medicalConditions,
        dietaryPreferences: entity.dietaryPreferences,
        isActive: entity.isActive,
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
