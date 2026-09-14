import { Module } from '@nestjs/common';
import { ClinicalAgentController } from './infrastructure/adapters/http/clinical-agent.controller';
import { ClinicalAgentService } from './application/services/clinical-agent.service';
import { RoutinesModule } from '../routines/infrastructure/routines.module';

@Module({
  imports: [RoutinesModule],
  controllers: [ClinicalAgentController],
  providers: [ClinicalAgentService],
  exports: [ClinicalAgentService],
})
export class ClinicalAgentModule {}
