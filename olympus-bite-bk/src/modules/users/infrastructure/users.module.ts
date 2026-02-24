import { Module } from '@nestjs/common';
import { UsersController } from './adapters/http/users.controller';
import { PrismaUserRepository } from './adapters/persistence/prisma-user.repository';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { GetUserUseCase } from '../application/use-cases/get-user.use-case';
import { GetUsersByTrainerUseCase } from '../application/use-cases/get-users-by-trainer.use-case';
import { UpdateProfileUseCase } from '../application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from '../application/use-cases/change-password.use-case';
import { CompleteOnboardingUseCase } from '../application/use-cases/complete-onboarding.use-case';
import { USER_REPOSITORY } from '../domain/ports/user.repository.port';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
    GetUsersByTrainerUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    CompleteOnboardingUseCase,
  ],
  exports: [USER_REPOSITORY, GetUserUseCase],
})
export class UsersModule {}
