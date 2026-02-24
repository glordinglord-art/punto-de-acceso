import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../domain/ports/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import * as crypto from 'crypto';

export class ChangePasswordDto {
  currentPassword!: string;
  newPassword!: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string, dto: ChangePasswordDto): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verify current password
    const hashedCurrent = crypto
      .createHash('sha256')
      .update(dto.currentPassword)
      .digest('hex');

    if (user.password !== hashedCurrent) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash new password and update
    const hashedNew = crypto
      .createHash('sha256')
      .update(dto.newPassword)
      .digest('hex');

    user.changePassword(hashedNew);

    return this.userRepository.update(user);
  }
}
