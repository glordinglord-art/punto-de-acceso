import { Module } from '@nestjs/common';
import { GymsController } from './adapters/http/gyms.controller';
import { PrismaModule } from '../../../shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GymsController],
  exports: [],
})
export class GymsModule {}
