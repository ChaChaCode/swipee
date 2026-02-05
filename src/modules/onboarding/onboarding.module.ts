import { Module } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { OnboardingResolver } from './onboarding.resolver';
import { GeocodingModule } from '../geocoding';

@Module({
  imports: [GeocodingModule],
  providers: [OnboardingService, OnboardingResolver],
  exports: [OnboardingService],
})
export class OnboardingModule {}
