import { Module, forwardRef } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsResolver } from './interactions.resolver';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [forwardRef(() => MatchesModule)],
  providers: [InteractionsService, InteractionsResolver],
  exports: [InteractionsService],
})
export class InteractionsModule {}
