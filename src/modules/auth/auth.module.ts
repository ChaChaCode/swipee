import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TelegramService } from './telegram.service';
import { UsersModule } from '../users/users.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [UsersModule, ProfilesModule],
  providers: [AuthService, AuthResolver, TelegramService],
  exports: [AuthService, TelegramService],
})
export class AuthModule {}
