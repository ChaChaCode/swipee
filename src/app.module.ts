import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { GraphqlModule } from './graphql';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ProfilesModule } from './modules/profiles';
import { InteractionsModule } from './modules/interactions';
import { MatchesModule } from './modules/matches';
import { NotificationsModule } from './modules/notifications';
import { UploadModule } from './modules/upload';
import { OnboardingModule } from './modules/onboarding';
import { DiscoveryModule } from './modules/discovery';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    GraphqlModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    InteractionsModule,
    MatchesModule,
    NotificationsModule,
    UploadModule,
    OnboardingModule,
    DiscoveryModule,
  ],
})
export class AppModule {}
