import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';

interface ClientPaymentRecord {
  id: string;
  clientId: string;
  trainerId: string;
  gymId: string | null;
  periodMonth: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paymentDate: Date | null;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentDelegate {
  findMany(args?: Record<string, unknown>): Promise<ClientPaymentRecord[]>;
  findUnique(
    args: Record<string, unknown>,
  ): Promise<ClientPaymentRecord | null>;
  upsert(args: Record<string, unknown>): Promise<ClientPaymentRecord>;
  delete(args: Record<string, unknown>): Promise<ClientPaymentRecord>;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly prisma: PrismaService) {}

  private get paymentModel(): PaymentDelegate {
    return (this.prisma as unknown as { clientPayment: PaymentDelegate })
      .clientPayment;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  @Get('overview')
  async getOverview(@Query('month') queryMonth?: string) {
    const month = queryMonth || this.getCurrentMonth();

    // Fetch active clients with trainer & branch details
    const activeClients = await this.prisma.user.findMany({
      where: {
        role: 'client',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        trainerId: true,
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Fetch all active trainers
    const trainers = await this.prisma.user.findMany({
      where: {
        role: 'trainer',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        branch: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    // Fetch payments for this month
    const payments = await this.paymentModel.findMany({
      where: { periodMonth: month },
    });

    const paymentsMap = new Map<string, (typeof payments)[0]>();
    for (const p of payments) {
      paymentsMap.set(p.clientId, p);
    }

    let totalRevenue = 0;
    let paidCount = 0;

    // Combine clients with payment info
    const clientPaymentRows = activeClients.map((client) => {
      const payment = paymentsMap.get(client.id);
      const isPaid = payment?.status === 'PAID';
      if (isPaid) {
        totalRevenue += payment?.amount || 0;
        paidCount++;
      }

      return {
        client: {
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          avatarUrl: client.avatarUrl,
        },
        trainer: client.trainer
          ? {
              id: client.trainer.id,
              name: client.trainer.name,
              email: client.trainer.email,
              branchName: client.trainer.branch?.name || 'Sin sede',
            }
          : null,
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              paymentMethod: payment.paymentMethod,
              paymentDate: payment.paymentDate,
              notes: payment.notes,
            }
          : {
              id: null,
              amount: 0,
              status: 'PENDING',
              paymentMethod: null,
              paymentDate: null,
              notes: null,
            },
      };
    });

    const totalClients = activeClients.length;
    const pendingCount = totalClients - paidCount;
    const collectionRate =
      totalClients > 0 ? Math.round((paidCount / totalClients) * 100) : 0;

    // Breakdown by trainer
    const trainersBreakdown = trainers.map((t) => {
      const assigned = clientPaymentRows.filter((r) => r.trainer?.id === t.id);
      const tPaid = assigned.filter((r) => r.payment.status === 'PAID');
      const tPending = assigned.length - tPaid.length;
      const tRevenue = tPaid.reduce(
        (acc, curr) => acc + curr.payment.amount,
        0,
      );

      return {
        trainerId: t.id,
        trainerName: t.name,
        trainerEmail: t.email,
        branchName: t.branch?.name || 'Sin sede',
        totalClients: assigned.length,
        paidCount: tPaid.length,
        pendingCount: tPending,
        totalRevenue: tRevenue,
        rate:
          assigned.length > 0
            ? Math.round((tPaid.length / assigned.length) * 100)
            : 0,
      };
    });

    return {
      month,
      summary: {
        totalRevenue,
        totalClients,
        paidCount,
        pendingCount,
        collectionRate,
      },
      trainersBreakdown,
      payments: clientPaymentRows,
    };
  }

  @Get('trainer/:trainerId')
  async getTrainerPayments(
    @Param('trainerId') trainerId: string,
    @Query('month') queryMonth?: string,
  ) {
    const month = queryMonth || this.getCurrentMonth();

    // Check trainer exists
    const trainer = await this.prisma.user.findUnique({
      where: { id: trainerId },
      select: { id: true, name: true, email: true },
    });

    if (!trainer) {
      throw new NotFoundException('Entrenador no encontrado');
    }

    // Find all clients assigned to this trainer (direct or linked colleagues)
    const colleagues = await this.prisma.trainerColleague.findMany({
      where: {
        OR: [{ trainerAId: trainerId }, { trainerBId: trainerId }],
      },
    });

    const sharedTrainerIds = new Set<string>([trainerId]);
    const specificClientIds = new Set<string>();

    for (const link of colleagues) {
      const isUnidir = link.mode === 'unidirectional';
      const hasSpecific = Array.isArray(link.sharedClientIds) && link.sharedClientIds.length > 0;

      if (link.mode === 'bidirectional') {
        const otherId = link.trainerAId === trainerId ? link.trainerBId : link.trainerAId;
        if (hasSpecific) {
          link.sharedClientIds.forEach((id) => specificClientIds.add(id));
        } else {
          sharedTrainerIds.add(otherId);
        }
      } else {
        // Unidirectional: trainerAId shares with trainerBId
        if (trainerId === link.trainerBId) {
          if (hasSpecific) {
            link.sharedClientIds.forEach((id) => specificClientIds.add(id));
          } else {
            sharedTrainerIds.add(link.trainerAId);
          }
        }
      }
    }

    const orConditions: any[] = [
      { trainerId: { in: Array.from(sharedTrainerIds) } },
    ];
    if (specificClientIds.size > 0) {
      orConditions.push({ id: { in: Array.from(specificClientIds) } });
    }

    const clients = await this.prisma.user.findMany({
      where: {
        role: 'client',
        isActive: true,
        OR: orConditions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        dietaryGoal: true,
        targetCalories: true,
        trainerId: true,
      },
      orderBy: { name: 'asc' },
    });

    const clientIds = clients.map((c) => c.id);
    const payments = await this.paymentModel.findMany({
      where: {
        clientId: { in: clientIds },
        periodMonth: month,
      },
    });

    const paymentsMap = new Map<string, (typeof payments)[0]>();
    for (const p of payments) {
      paymentsMap.set(p.clientId, p);
    }

    let totalRevenue = 0;
    let paidCount = 0;

    const clientRows = clients.map((c) => {
      const payment = paymentsMap.get(c.id);
      const isPaid = payment?.status === 'PAID';
      if (isPaid) {
        totalRevenue += payment?.amount || 0;
        paidCount++;
      }

      return {
        client: {
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          avatarUrl: c.avatarUrl,
          dietaryGoal: c.dietaryGoal,
          targetCalories: c.targetCalories,
        },
        payment: payment
          ? {
              id: payment.id,
              amount: payment.amount,
              status: payment.status,
              paymentMethod: payment.paymentMethod,
              paymentDate: payment.paymentDate,
              notes: payment.notes,
            }
          : {
              id: null,
              amount: 0,
              status: 'PENDING',
              paymentMethod: null,
              paymentDate: null,
              notes: null,
            },
      };
    });

    const totalClients = clients.length;
    const pendingCount = totalClients - paidCount;
    const collectionRate =
      totalClients > 0 ? Math.round((paidCount / totalClients) * 100) : 0;

    return {
      month,
      trainer,
      summary: {
        totalRevenue,
        totalClients,
        paidCount,
        pendingCount,
        collectionRate,
      },
      clients: clientRows,
    };
  }

  @Post()
  async recordPayment(
    @Body()
    dto: {
      clientId: string;
      trainerId?: string;
      periodMonth: string;
      amount: number;
      status?: string;
      paymentMethod?: string;
      paymentDate?: string;
      notes?: string;
    },
  ) {
    if (!dto.clientId || !dto.periodMonth) {
      throw new BadRequestException('clientId y periodMonth son obligatorios');
    }

    const client = await this.prisma.user.findUnique({
      where: { id: dto.clientId },
      select: { id: true, trainerId: true, gymId: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const trainerId = dto.trainerId || client.trainerId;
    if (!trainerId) {
      throw new BadRequestException(
        'Se requiere un entrenador asociado al cliente',
      );
    }

    const paymentDate = dto.paymentDate
      ? new Date(dto.paymentDate)
      : new Date();

    const payment = await this.paymentModel.upsert({
      where: {
        clientId_periodMonth: {
          clientId: dto.clientId,
          periodMonth: dto.periodMonth,
        },
      },
      create: {
        clientId: dto.clientId,
        trainerId,
        gymId: client.gymId,
        periodMonth: dto.periodMonth,
        amount: Number(dto.amount) || 0,
        status: dto.status || 'PAID',
        paymentMethod: dto.paymentMethod || 'Transferencia',
        paymentDate,
        notes: dto.notes || null,
      },
      update: {
        amount: Number(dto.amount) || 0,
        status: dto.status || 'PAID',
        paymentMethod: dto.paymentMethod || 'Transferencia',
        paymentDate,
        notes: dto.notes || null,
        trainerId,
      },
    });

    return payment;
  }

  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    const payment = await this.paymentModel.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    await this.paymentModel.delete({
      where: { id },
    });

    return { success: true, message: 'Pago eliminado correctamente' };
  }
}
