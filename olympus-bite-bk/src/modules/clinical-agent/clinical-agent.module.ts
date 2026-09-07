import { Module } from '@nestjs/common';
import { ClinicalAgentController } from './infrastructure/adapters/http/clinical-agent.controller';
import { ClinicalAgentService } from './application/services/clinical-agent.service';

@Module({
  controllers: [ClinicalAgentController],
  providers: [ClinicalAgentService],
  exports: [ClinicalAgentService],
})
export class ClinicalAgentModule {}
