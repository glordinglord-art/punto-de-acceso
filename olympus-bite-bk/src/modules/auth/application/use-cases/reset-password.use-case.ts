import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user.repository.port';
import * as crypto from 'crypto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new BadRequestException(
        'El enlace de recuperación es inválido o ya fue utilizado',
      );
    }

    if (
      !user.resetTokenExpires ||
      user.resetTokenExpires.getTime() < Date.now()
    ) {
      throw new BadRequestException('El enlace de recuperación ha expirado');
    }

    // Hash new password using SHA-256 (matches current auth hashing)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(newPassword)
      .digest('hex');

    user.changePassword(hashedPassword);

    // Clear reset token
    user.resetToken = null;
    user.resetTokenExpires = null;

    await this.userRepository.update(user);
  }
}
