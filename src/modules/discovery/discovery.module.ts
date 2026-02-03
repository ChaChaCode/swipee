import { Module } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { DiscoveryResolver } from './discovery.resolver';

@Module({
  providers: [DiscoveryService, DiscoveryResolver],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}
