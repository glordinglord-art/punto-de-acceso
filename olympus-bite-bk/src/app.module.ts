import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { UsersModule } from './modules/users/infrastructure/users.module';
import { MealsModule } from './modules/meals/infrastructure/meals.module';
import { RoutinesModule } from './modules/routines/infrastructure/routines.module';
import { DashboardModule } from './modules/dashboard/infrastructure/dashboard.module';
import { TasksModule } from './modules/tasks/infrastructure/tasks.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MealsModule,
    RoutinesModule,
    DashboardModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
