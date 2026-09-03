import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { UserRole } from '../../../../users/domain/enums/user-role.enum';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  async getOverview() {
    const [
      totalGyms,
      totalBranches,
      trainers,
      totalClients,
      activeRoutines,
      gymsWithBranches,
    ] = await Promise.all([
      this.prisma.gym.count({ where: { isActive: true } }),
      this.prisma.branch.count({ where: { isActive: true } }),
      this.prisma.user.findMany({
        where: {
          role: {
            in: [
              UserRole.TRAINER as any,
              UserRole.ADMIN as any,
              UserRole.SUPER_ADMIN as any,
            ],
          },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          role: true,
          gymId: true,
          branchId: true,
          gym: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true, city: true } },
          _count: {
            select: {
              clients: { where: { isActive: true } },
              routinesAsTrainer: { where: { isActive: true } },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: { role: UserRole.CLIENT as any, isActive: true },
      }),
      this.prisma.routine.count({
        where: { isActive: true },
      }),
      this.prisma.gym.findMany({
        where: { isActive: true },
        include: {
          branches: {
            where: { isActive: true },
            include: {
              users: {
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Calcular distribución por sede
    const branchDistribution = gymsWithBranches.flatMap((gym) =>
      gym.branches.map((branch) => {
        const trainersInBranch = branch.users.filter(
          (u) => u.role !== (UserRole.CLIENT as any),
        );
        const clientsInBranch = branch.users.filter(
          (u) => u.role === (UserRole.CLIENT as any),
        );
        return {
          branchId: branch.id,
          branchName: branch.name,
          gymId: gym.id,
          gymName: gym.name,
          city: branch.city,
          trainersCount: trainersInBranch.length,
          clientsCount: clientsInBranch.length,
        };
      }),
    );

    // Entrenadores con su conteo de clientes
    const trainersOverview = trainers.map((t) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      avatarUrl: t.avatarUrl,
      role: t.role,
      gymName: t.gym?.name ?? 'Sin Gimnasio',
      branchName: t.branch?.name ?? 'Sede General / Sin Asignar',
      clientsCount: t._count.clients,
      activeRoutinesCount: t._count.routinesAsTrainer,
    }));

    return {
      success: true,
      data: {
        totalGyms,
        totalBranches,
        totalTrainers: trainers.length,
        totalClients,
        activeRoutines,
        trainersOverview,
        branchDistribution,
      },
    };
  }

  @Get('trainers')
  async getTrainersRoster() {
    const trainers = await this.prisma.user.findMany({
      where: {
        role: {
          in: [
            UserRole.TRAINER as any,
            UserRole.ADMIN as any,
            UserRole.SUPER_ADMIN as any,
          ],
        },
        isActive: true,
      },
      include: {
        gym: true,
        branch: true,
        colleaguesAsA: {
          include: {
            trainerB: { select: { id: true, name: true, email: true } },
          },
        },
        colleaguesAsB: {
          include: {
            trainerA: { select: { id: true, name: true, email: true } },
          },
        },
        clients: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            dietaryGoal: true,
            targetCalories: true,
            onboardingCompleted: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            routinesAsTrainer: { where: { isActive: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: trainers.map((t) => {
        const linked = [
          ...t.colleaguesAsA.map((c: any) => ({
            ...c.trainerB,
            linkId: c.id,
            mode: c.mode || 'bidirectional',
            roleInLink: 'source',
          })),
          ...t.colleaguesAsB.map((c: any) => ({
            ...c.trainerA,
            linkId: c.id,
            mode: c.mode || 'bidirectional',
            roleInLink: 'recipient',
          })),
        ];

        return {
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          avatarUrl: t.avatarUrl,
          role: t.role,
          gymId: t.gymId,
          gymName: t.gym?.name ?? null,
          branchId: t.branchId,
          branchName: t.branch?.name ?? null,
          branchCity: t.branch?.city ?? null,
          activeRoutinesCount: t._count.routinesAsTrainer,
          clients: t.clients,
          linkedTrainers: linked,
        };
      }),
    };
  }

  @Post('trainers/link')
  async linkTrainers(
    @Body()
    body: {
      trainerAId: string;
      trainerBId: string;
      gymId?: string | null;
      mode?: 'bidirectional' | 'unidirectional';
    },
  ) {
    if (!body.trainerAId || !body.trainerBId) {
      throw new BadRequestException('Debes proporcionar ambos entrenadores');
    }
    if (body.trainerAId === body.trainerBId) {
      throw new BadRequestException(
        'No puedes enlazar un entrenador consigo mismo',
      );
    }

    const mode = body.mode || 'bidirectional';

    const existing = await (this.prisma.trainerColleague as any).findFirst({
      where: {
        OR: [
          { trainerAId: body.trainerAId, trainerBId: body.trainerBId },
          { trainerAId: body.trainerBId, trainerBId: body.trainerAId },
        ],
      },
    });

    if (existing) {
      const updated = await (this.prisma.trainerColleague as any).update({
        where: { id: existing.id },
        data: {
          trainerAId: body.trainerAId,
          trainerBId: body.trainerBId,
          mode,
          gymId: body.gymId ?? existing.gymId,
        },
        include: {
          trainerA: { select: { id: true, name: true, email: true } },
          trainerB: { select: { id: true, name: true, email: true } },
        },
      });

      return {
        success: true,
        message:
          mode === 'bidirectional'
            ? 'Enlace actualizado a modo mutuo (ambos comparten sus atletas)'
            : `Enlace actualizado: ${updated.trainerA.name} comparte con ${updated.trainerB.name}`,
        data: updated,
      };
    }

    const link = await (this.prisma.trainerColleague as any).create({
      data: {
        trainerAId: body.trainerAId,
        trainerBId: body.trainerBId,
        gymId: body.gymId ?? null,
        mode,
      },
      include: {
        trainerA: { select: { id: true, name: true, email: true } },
        trainerB: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      success: true,
      message:
        mode === 'bidirectional'
          ? 'Entrenadores enlazados en modo mutuo con éxito'
          : `Enlace unidireccional creado: ${link.trainerA.name} comparte con ${link.trainerB.name}`,
      data: link,
    };
  }

  @Get('trainers/links')
  async getTrainerLinks() {
    const links = await this.prisma.trainerColleague.findMany({
      include: {
        trainerA: {
          select: { id: true, name: true, email: true, branchId: true },
        },
        trainerB: {
          select: { id: true, name: true, email: true, branchId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: links };
  }

  @Delete('trainers/link/:linkId')
  async unlinkTrainers(@Param('linkId') linkId: string) {
    await this.prisma.trainerColleague.delete({ where: { id: linkId } });
    return { success: true, message: 'Enlace eliminado con éxito' };
  }

  @Patch('users/:userId/assign')
  async assignUser(
    @Param('userId') userId: string,
    @Body()
    body: {
      gymId?: string | null;
      branchId?: string | null;
      trainerId?: string | null;
    },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        gymId: body.gymId,
        branchId: body.branchId,
        trainerId: body.trainerId,
      },
      include: {
        gym: true,
        branch: true,
        trainer: { select: { id: true, name: true } },
      },
    });

    return { success: true, data: user };
  }

  @Patch('users/:userId/role')
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
    return { success: true, data: user };
  }

  @Post('seed-default')
  async seedDefaultStructure() {
    // 1. Check or create default Gym "Punto de Inflexión"
    let gym = await this.prisma.gym.findFirst({
      where: { slug: 'punto-de-inflexion' },
    });

    if (!gym) {
      gym = await this.prisma.gym.create({
        data: {
          name: 'Punto de Inflexión',
          slug: 'punto-de-inflexion',
          description:
            'Centro de Alto Rendimiento y Entrenamiento Personalizado',
        },
      });
    }

    // 2. Check or create initial branches (Sedes)
    const defaultBranches = [
      {
        name: 'Sede Poblado',
        slug: 'sede-poblado',
        city: 'Medellín',
        address: 'El Poblado',
      },
      {
        name: 'Sede Laureles',
        slug: 'sede-laureles',
        city: 'Medellín',
        address: 'Laureles',
      },
      {
        name: 'Sede Envigado',
        slug: 'sede-envigado',
        city: 'Envigado',
        address: 'Zona Sur',
      },
    ];

    const createdBranches: any[] = [];
    for (const b of defaultBranches) {
      let branch = await this.prisma.branch.findUnique({
        where: {
          gymId_slug: {
            gymId: gym.id,
            slug: b.slug,
          },
        },
      });

      if (!branch) {
        branch = await this.prisma.branch.create({
          data: {
            gymId: gym.id,
            name: b.name,
            slug: b.slug,
            city: b.city,
            address: b.address,
          },
        });
      }
      createdBranches.push(branch);
    }

    // 3. Link all existing users without gym to this main gym
    await this.prisma.user.updateMany({
      where: { gymId: null },
      data: { gymId: gym.id },
    });

    return {
      success: true,
      message: 'Estructura inicial de Punto de Inflexión configurada con éxito',
      data: {
        gym,
        branches: createdBranches,
      },
    };
  }
}
