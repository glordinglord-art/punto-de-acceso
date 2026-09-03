import { Module } from '@nestjs/common';
import { AdminController } from './adapters/http/admin.controller';
import { PaymentsController } from './adapters/http/payments.controller';
import { AssessmentsController } from './adapters/http/assessments.controller';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController, PaymentsController, AssessmentsController],
  exports: [],
})
export class AdminModule {}
