import { RepositoryPort } from '../../../../shared/domain/repository.port';
import { InvitationCode } from '../entities/invitation-code.entity';

export const INVITATION_CODE_REPOSITORY = Symbol('INVITATION_CODE_REPOSITORY');

export interface InvitationCodeRepositoryPort extends RepositoryPort<InvitationCode> {
  findByCode(code: string): Promise<InvitationCode | null>;
  findByTrainerId(trainerId: string): Promise<InvitationCode[]>;
}
