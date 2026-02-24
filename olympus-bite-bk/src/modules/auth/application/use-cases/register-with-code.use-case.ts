import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '../../../users/domain/ports/user.repository.port';
import {
  INVITATION_CODE_REPOSITORY,
  InvitationCodeRepositoryPort,
} from '../../domain/ports/invitation-code.repository.port';
import { User } from '../../../users/domain/entities/user.entity';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { RegisterDto } from '../dtos/register.dto';
import * as crypto from 'crypto';

@Injectable()
export class RegisterWithCodeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
    @Inject(INVITATION_CODE_REPOSITORY)
    private readonly invitationCodeRepository: InvitationCodeRepositoryPort,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const adminCode = process.env.ADMIN_INVITATION_CODE || '9966';
    const isAdminCode = dto.invitationCode === adminCode;

    // Si NO es el código admin, validar contra la DB
    let trainerId: string | undefined;
    let invitation:
      | import('../../domain/entities/invitation-code.entity').InvitationCode
      | null = null;

    if (!isAdminCode) {
      invitation = await this.invitationCodeRepository.findByCode(
        dto.invitationCode,
      );
      if (!invitation || !invitation.isValid()) {
        throw new BadRequestException(
          'Código de invitación inválido o expirado',
        );
      }
      trainerId = invitation.trainerId;
    }

    // Verificar que el email no exista
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(dto.password)
      .digest('hex');

    const user = new User({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      role: isAdminCode ? UserRole.TRAINER : UserRole.CLIENT,
      trainerId,
      phone: dto.phone,
    });

    const savedUser = await this.userRepository.save(user);

    // Si fue código de invitación normal, marcarlo como usado
    if (!isAdminCode && invitation) {
      invitation.markAsUsed(savedUser.id);
      await this.invitationCodeRepository.update(invitation);
    }

    return savedUser;
  }
}
