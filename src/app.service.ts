import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { MigrationService } from './migrate.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private readonly migrationService: MigrationService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    if (this.configService.get('RUN_MIGRATIONS') === 'true') {
      await this.migrationService.up();
    }
  }
}
