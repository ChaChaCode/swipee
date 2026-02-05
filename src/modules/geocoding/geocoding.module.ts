import { Module } from '@nestjs/common';
import { GeocodingService } from './geocoding.service';
import { GeocodingResolver } from './geocoding.resolver';

@Module({
  providers: [GeocodingService, GeocodingResolver],
  exports: [GeocodingService],
})
export class GeocodingModule {}
