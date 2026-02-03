import { Module, forwardRef } from '@nestjs/common';
import { SwipesService } from './swipes.service';
import { SwipesResolver, SwipeResultResolver } from './swipes.resolver';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [forwardRef(() => MatchesModule)],
  providers: [SwipesService, SwipesResolver, SwipeResultResolver],
  exports: [SwipesService],
})
export class SwipesModule {}
