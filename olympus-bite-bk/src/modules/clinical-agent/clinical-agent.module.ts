import { Module } from '@nestjs/common';
import { ClinicalAgentController } from './infrastructure/adapters/http/clinical-agent.controller';
import { ClinicalAgentService } from './application/services/clinical-agent.service';
import { ClinicalActionService } from './application/services/clinical-action.service';

@Module({
  controllers: [ClinicalAgentController],
  providers: [ClinicalAgentService, ClinicalActionService],
  exports: [ClinicalAgentService],
})
export class ClinicalAgentModule {}
