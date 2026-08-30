import { Module } from '@nestjs/common';
import { AdminController } from './adapters/http/admin.controller';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  exports: [],
})
export class AdminModule {}
