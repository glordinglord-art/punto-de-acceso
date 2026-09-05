import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { UserRepositoryPort } from '../../../domain/ports/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
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
        trainerId: raw.trainerId ?? undefined,
        gymId: (raw as any).gymId ?? undefined,
        branchId: (raw as any).branchId ?? undefined,
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
    // Find all linked colleague trainers
    const colleagueLinks = await this.prisma.trainerColleague.findMany({
      where: {
        OR: [{ trainerAId: trainerId }, { trainerBId: trainerId }],
      },
    });

    interface ColleagueRow {
      trainerAId: string;
      trainerBId: string;
      mode?: string;
      sharedClientIds?: string[];
    }

    const trainerIds = new Set<string>([trainerId]);
    const specificClientIds = new Set<string>();

    for (const link of colleagueLinks as unknown as ColleagueRow[]) {
      const mode = link.mode || 'bidirectional';
      const hasSpecific = Array.isArray(link.sharedClientIds) && link.sharedClientIds.length > 0;

      if (mode === 'bidirectional') {
        const otherId = link.trainerAId === trainerId ? link.trainerBId : link.trainerAId;
        if (hasSpecific) {
          link.sharedClientIds!.forEach((id) => specificClientIds.add(id));
        } else {
          trainerIds.add(otherId);
        }
      } else {
        // Unidirectional: trainerAId shares with trainerBId
        // If current coach is trainerBId (the recipient), they see trainerAId's clients
        if (trainerId === link.trainerBId) {
          if (hasSpecific) {
            link.sharedClientIds!.forEach((id) => specificClientIds.add(id));
          } else {
            trainerIds.add(link.trainerAId);
          }
        }
      }
    }

    const orConditions: any[] = [
      { trainerId: { in: Array.from(trainerIds) } },
    ];
    if (specificClientIds.size > 0) {
      orConditions.push({ id: { in: Array.from(specificClientIds) } });
    }

    const rows = await this.prisma.user.findMany({
      where: {
        OR: orConditions,
        isActive: true,
      },
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
