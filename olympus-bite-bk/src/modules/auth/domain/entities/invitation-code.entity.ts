import { BaseEntity } from '../../../../shared/domain/base.entity';
import { randomBytes } from 'crypto';

export class InvitationCode extends BaseEntity {
  code: string;
  trainerId: string;
  isUsed: boolean;
  usedByUserId: string | null;
  expiresAt: Date;

  constructor(trainerId: string, id?: string) {
    super(id);
    this.code = InvitationCode.generateCode();
    this.trainerId = trainerId;
    this.isUsed = false;
    this.usedByUserId = null;
    // Expira en 7 días
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  private static generateCode(): string {
    return `OB-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  markAsUsed(userId: string): void {
    this.isUsed = true;
    this.usedByUserId = userId;
    this.markUpdated();
  }

  isValid(): boolean {
    return !this.isUsed && this.expiresAt > new Date();
  }
}
