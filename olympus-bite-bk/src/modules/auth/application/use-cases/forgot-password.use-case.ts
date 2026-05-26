import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user.repository.port';
import {
  EMAIL_SERVICE,
  EmailServicePort,
} from '../../../../shared/domain/email.service.port';
import * as crypto from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EMAIL_SERVICE)
    private readonly emailService: EmailServicePort,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // For security, don't throw an error saying "email not found" so attackers don't probe emails.
      // But in local dev or simple MVPs it's fine. Let's throw a NotFoundException to make it clear for the user/frontend.
      throw new NotFoundException(
        'No se encontró ningún usuario con ese correo electrónico',
      );
    }

    // Generate random secure token
    const token = crypto.randomBytes(32).toString('hex');
    // Expire in 1 hour
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Save token to user
    user.resetToken = token;
    user.resetTokenExpires = expires;
    await this.userRepository.update(user);

    // Send email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await this.emailService.sendPasswordResetEmail(
      user.email,
      resetLink,
      user.name,
    );
  }
}
