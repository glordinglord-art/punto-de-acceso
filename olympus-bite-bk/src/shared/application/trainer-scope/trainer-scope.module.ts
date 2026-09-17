import { Global, Module } from '@nestjs/common';
import { TrainerScopeService } from './trainer-scope.service';

/**
 * Global como PrismaModule: cualquier modulo que necesite saber a quien ve un
 * entrenador lo inyecta sin tener que importar nada.
 */
@Global()
@Module({
  providers: [TrainerScopeService],
  exports: [TrainerScopeService],
})
export class TrainerScopeModule {}
