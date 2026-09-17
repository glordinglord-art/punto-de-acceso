import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { TrainerScopeService } from '../../../../../shared/application/trainer-scope/trainer-scope.service';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import type { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainerScope: TrainerScopeService,
  ) {}

  private toDomain(raw: PrismaUser): User {
    const user = new User(
      {
        email: raw.email,
        name: raw.name,
        password: raw.password,
        role: raw.role as unknown as UserRole,
        avatarUrl: raw.avatarUrl ?? undefined,
        phone: raw.phone ?? undefined,
        trainerId: raw.trainerId ?? undefined,
        gymId: (raw as any).gymId ?? undefined,
        branchId: (raw as any).branchId ?? undefined,
        dietaryGoal: raw.dietaryGoal ?? undefined,
        weight: raw.weight ?? undefined,
        height: raw.height ?? undefined,
        targetCalories: raw.targetCalories ?? undefined,
        targetProtein: (raw as any).targetProtein ?? undefined,
        targetCarbs: (raw as any).targetCarbs ?? undefined,
        targetFats: (raw as any).targetFats ?? undefined,
        weightUnitPreference: (raw as any).weightUnitPreference ?? 'kg',
        gender: (raw as any).gender ?? undefined,
        age: (raw as any).age ?? undefined,
        anamnesisData: (raw as any).anamnesisData ?? undefined,
        onboardingCompleted: raw.onboardingCompleted,
        experienceLevel: raw.experienceLevel ?? undefined,
        equipmentAccess: raw.equipmentAccess ?? undefined,
        medicalConditions: raw.medicalConditions ?? undefined,
        dietaryPreferences: raw.dietaryPreferences ?? undefined,
      },
      raw.id,
    );
    user.isActive = raw.isActive;
    user.resetToken = raw.resetToken;
    user.resetTokenExpires = raw.resetTokenExpires;
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
    // La resolucion de colegas vinculados vive en TrainerScopeService para que
    // comidas, panel y clientes vean exactamente la misma cartera.
    const where = await this.trainerScope.buildVisibleUsersWhere(trainerId, {
      includeSelf: true,
    });

    const rows = await this.prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
    });
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
        trainerId: entity.trainerId,
        gymId: entity.gymId,
        branchId: entity.branchId,
        dietaryGoal: entity.dietaryGoal,
        weight: entity.weight,
        height: entity.height,
        targetCalories: entity.targetCalories,
        targetProtein: entity.targetProtein,
        targetCarbs: entity.targetCarbs,
        targetFats: entity.targetFats,
        weightUnitPreference: entity.weightUnitPreference,
        gender: entity.gender,
        age: entity.age,
        anamnesisData: entity.anamnesisData,
        onboardingCompleted: entity.onboardingCompleted,
        experienceLevel: entity.experienceLevel,
        equipmentAccess: entity.equipmentAccess,
        medicalConditions: entity.medicalConditions,
        dietaryPreferences: entity.dietaryPreferences,
        isActive: entity.isActive,
        resetToken: entity.resetToken,
        resetTokenExpires: entity.resetTokenExpires,
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
        trainerId: entity.trainerId,
        gymId: entity.gymId,
        branchId: entity.branchId,
        dietaryGoal: entity.dietaryGoal,
        weight: entity.weight,
        height: entity.height,
        targetCalories: entity.targetCalories,
        targetProtein: entity.targetProtein,
        targetCarbs: entity.targetCarbs,
        targetFats: entity.targetFats,
        weightUnitPreference: entity.weightUnitPreference,
        gender: entity.gender,
        age: entity.age,
        anamnesisData: entity.anamnesisData,
        onboardingCompleted: entity.onboardingCompleted,
        experienceLevel: entity.experienceLevel,
        equipmentAccess: entity.equipmentAccess,
        medicalConditions: entity.medicalConditions,
        dietaryPreferences: entity.dietaryPreferences,
        isActive: entity.isActive,
        resetToken: entity.resetToken,
        resetTokenExpires: entity.resetTokenExpires,
      },
    });
    return this.toDomain(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction([
      // Delete user's records manually to avoid FK constraint errors if not cascade in schema
      this.prisma.meal.deleteMany({ where: { userId: id } }),
      this.prisma.routine.deleteMany({ where: { clientId: id } }),
      this.prisma.routine.deleteMany({ where: { trainerId: id } }),
      this.prisma.workoutLog.deleteMany({ where: { userId: id } }),
      this.prisma.invitationCode.deleteMany({ where: { usedByUserId: id } }),
      this.prisma.invitationCode.deleteMany({ where: { trainerId: id } }),
      this.prisma.dietChatMessage.deleteMany({ where: { userId: id } }),
      this.prisma.dailyTask.deleteMany({ where: { userId: id } }),
      this.prisma.taskLog.deleteMany({ where: { userId: id } }),
      this.prisma.waterLog.deleteMany({ where: { userId: id } }),
      this.prisma.notificationSubscription.deleteMany({
        where: { userId: id },
      }),
      this.prisma.notificationPreference.deleteMany({ where: { userId: id } }),
      this.prisma.user.updateMany({
        where: { trainerId: id },
        data: { trainerId: null },
      }),
      this.prisma.user.delete({ where: { id } }),
    ]);
  }

  async linkToTrainer(email: string, trainerId: string): Promise<User | null> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (!existing) return null;
    const raw = await this.prisma.user.update({
      where: { email },
      data: { trainerId },
    });
    return this.toDomain(raw);
  }

  async findByResetToken(token: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: { resetToken: token },
    });
    return raw ? this.toDomain(raw) : null;
  }
}
