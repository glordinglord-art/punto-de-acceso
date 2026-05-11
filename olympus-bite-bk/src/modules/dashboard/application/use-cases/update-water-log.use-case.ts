import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

@Injectable()
export class UpdateWaterLogUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, date: string, amount: number) {
    const log = await this.prisma.waterLog.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        amount,
      },
      create: {
        userId,
        date,
        amount,
      },
    });
    return log;
  }
}
