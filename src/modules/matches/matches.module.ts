import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesResolver } from './matches.resolver';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [MatchesService, MatchesResolver],
  exports: [MatchesService],
})
export class MatchesModule {}
