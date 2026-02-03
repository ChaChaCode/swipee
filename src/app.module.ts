import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { GraphqlModule } from './graphql';
import { AuthModule } from './modules/auth';
import { UsersModule } from './modules/users';
import { ProfilesModule } from './modules/profiles';
import { SwipesModule } from './modules/swipes';
import { MatchesModule } from './modules/matches';
import { MessagesModule } from './modules/messages';
import { UploadModule } from './modules/upload';
import { OnboardingModule } from './modules/onboarding';

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
    SwipesModule,
    MatchesModule,
    MessagesModule,
    UploadModule,
    OnboardingModule,
  ],
})
export class AppModule {}
