import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './adapters/http/auth.controller';
import { PrismaInvitationCodeRepository } from './adapters/persistence/prisma-invitation-code.repository';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterWithCodeUseCase } from '../application/use-cases/register-with-code.use-case';
import { GenerateInvitationCodeUseCase } from '../application/use-cases/generate-invitation-code.use-case';
import { INVITATION_CODE_REPOSITORY } from '../domain/ports/invitation-code.repository.port';
import { UsersModule } from '../../users/infrastructure/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)],
  controllers: [AuthController],
  providers: [
    {
      provide: INVITATION_CODE_REPOSITORY,
      useClass: PrismaInvitationCodeRepository,
    },
    LoginUseCase,
    RegisterWithCodeUseCase,
    GenerateInvitationCodeUseCase,
  ],
  exports: [INVITATION_CODE_REPOSITORY],
})
export class AuthModule {}
