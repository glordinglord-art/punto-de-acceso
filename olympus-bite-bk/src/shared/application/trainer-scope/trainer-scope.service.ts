import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export interface TrainerScopeOptions {
  /**
   * Incluir al propio entrenador en el resultado. El modulo de clientes lo hace
   * para que el coach se vea a si mismo como una ficha mas.
   */
  includeSelf?: boolean;
}

/**
 * Unico sitio donde se decide que usuarios puede ver un entrenador.
 *
 * Un coach ve a sus clientes directos (User.trainerId) y ademas a los que le
 * comparten los colegas con los que esta vinculado (tabla trainer_colleagues):
 *
 *  - bidirectional sin sharedClientIds -> cada uno ve la cartera completa del otro
 *  - bidirectional con sharedClientIds -> solo esos clientes concretos
 *  - unidirectional                    -> A comparte con B; solo B ve lo de A
 *
 * Antes cada modulo resolvia esto por su cuenta y varios se quedaban solo con
 * los clientes directos, de forma que los vinculados no aparecian.
 */
@Injectable()
export class TrainerScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Filtro Prisma con todos los usuarios activos visibles para el entrenador.
   * Se devuelve el `where` en vez de los usuarios para que cada modulo aplique
   * su propio `select` y no arrastre columnas que no necesita.
   */
  async buildVisibleUsersWhere(
    trainerId: string,
    options: TrainerScopeOptions = {},
  ): Promise<Prisma.UserWhereInput> {
    const { includeSelf = true } = options;

    const colleagueLinks = await this.prisma.trainerColleague.findMany({
      where: {
        OR: [{ trainerAId: trainerId }, { trainerBId: trainerId }],
      },
    });

    // Entrenadores cuya cartera completa puede ver, el propio incluido
    const trainerIds = new Set<string>([trainerId]);
    // Clientes sueltos compartidos de forma explicita
    const specificClientIds = new Set<string>();

    for (const link of colleagueLinks) {
      const mode = link.mode || 'bidirectional';
      const sharedIds = link.sharedClientIds ?? [];
      const hasSpecific = sharedIds.length > 0;

      if (mode === 'bidirectional') {
        const otherId =
          link.trainerAId === trainerId ? link.trainerBId : link.trainerAId;
        if (hasSpecific) {
          sharedIds.forEach((id) => specificClientIds.add(id));
        } else {
          trainerIds.add(otherId);
        }
        continue;
      }

      // Unidireccional: A comparte con B. Solo el receptor (B) ve lo de A.
      if (trainerId === link.trainerBId) {
        if (hasSpecific) {
          sharedIds.forEach((id) => specificClientIds.add(id));
        } else {
          trainerIds.add(link.trainerAId);
        }
      }
    }

    const or: Prisma.UserWhereInput[] = [
      { trainerId: { in: Array.from(trainerIds) } },
    ];
    if (includeSelf) {
      or.push({ id: trainerId });
    }
    if (specificClientIds.size > 0) {
      or.push({ id: { in: Array.from(specificClientIds) } });
    }

    return { OR: or, isActive: true };
  }

  /** IDs de los usuarios visibles para el entrenador. */
  async getVisibleUserIds(
    trainerId: string,
    options: TrainerScopeOptions = {},
  ): Promise<string[]> {
    const where = await this.buildVisibleUsersWhere(trainerId, options);
    const rows = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });
    return rows.map((r) => r.id);
  }
}
