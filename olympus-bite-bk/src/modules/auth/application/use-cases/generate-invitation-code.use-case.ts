import { Inject, Injectable } from '@nestjs/common';
import {
  INVITATION_CODE_REPOSITORY,
  InvitationCodeRepositoryPort,
} from '../../domain/ports/invitation-code.repository.port';
import { InvitationCode } from '../../domain/entities/invitation-code.entity';

@Injectable()
export class GenerateInvitationCodeUseCase {
  constructor(
    @Inject(INVITATION_CODE_REPOSITORY)
    private readonly invitationCodeRepository: InvitationCodeRepositoryPort,
  ) {}

  async execute(trainerId: string): Promise<InvitationCode> {
    const code = new InvitationCode(trainerId);
    return this.invitationCodeRepository.save(code);
  }

  async getByTrainer(trainerId: string): Promise<InvitationCode[]> {
    return this.invitationCodeRepository.findByTrainerId(trainerId);
  }
}
