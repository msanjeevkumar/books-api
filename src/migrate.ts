import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationService } from './migrate.service';
import * as process from 'process'; // Adjust the import path based on your project structure

async function migrate(command: string) {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    if (command === 'down') {
      await migrationService.down();
    } else if (command === 'up') {
      await migrationService.up();
    }
  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await app.close();
  }
}

migrate(process.argv[2]);
