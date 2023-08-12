import { Injectable, Logger } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { RunnableMigration, SequelizeStorage, Umzug } from 'umzug';
import { QueryInterface } from 'sequelize';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly sequelize: Sequelize) {}

  private async getMigrationsFromDirectory(
    directoryPath: string,
  ): Promise<RunnableMigration<QueryInterface>[]> {
    const migrationFiles = (await fs.readdir(directoryPath)).filter(
      (file) => !file.endsWith('.d.ts'),
    );
    const migrations: RunnableMigration<QueryInterface>[] = [];

    const shouldSelectJsFiles =
      migrationFiles.length > 0 &&
      migrationFiles.some((migrationFile) => migrationFile.endsWith('.js'));

    for (const migrationFile of migrationFiles) {
      if (
        shouldSelectJsFiles
          ? migrationFile.endsWith('.js')
          : migrationFile.endsWith('.ts')
      ) {
        const migrationModule: Pick<
          RunnableMigration<QueryInterface>,
          'up' | 'down'
        > = await import(path.join(directoryPath, migrationFile));

        if (this.isValidMigration(migrationModule)) {
          migrations.push({
            name: path.basename(migrationFile),
            ...migrationModule,
          });
        }
      }
    }

    return migrations;
  }

  private isValidMigration(
    migrationModule: any,
  ): migrationModule is Pick<RunnableMigration<QueryInterface>, 'up' | 'down'> {
    return (
      typeof migrationModule === 'object' &&
      migrationModule.up &&
      migrationModule.down
    );
  }

  private async init(): Promise<Umzug> {
    return new Umzug({
      storage: new SequelizeStorage({ sequelize: this.sequelize }),
      migrations: await this.getMigrationsFromDirectory(
        path.join(__dirname, 'migrations'),
      ),
      context: this.sequelize.getQueryInterface(),
      logger: {
        info: this.logger.log.bind(this.logger),
        error: this.logger.error.bind(this.logger),
        debug: this.logger.debug.bind(this.logger),
        warn: this.logger.warn.bind(this.logger),
      },
    });
  }

  async up(): Promise<void> {
    const umzug = await this.init();

    try {
      const pendingMigrations = await umzug.pending();
      if (pendingMigrations.length === 0) {
        this.logger.log('No pending migrations.');
        return;
      }

      const migrations = await umzug.up();
      this.logger.log(
        'Migrations successfully applied:',
        JSON.stringify(migrations),
      );
    } catch (error) {
      this.logger.error('Error applying migrations:', error);
    }
  }

  async down(): Promise<void> {
    const umzug = await this.init();

    try {
      const executedMigrations = await umzug.executed();
      if (executedMigrations.length <= 0) {
        this.logger.log('No executed migrations.');
        return;
      }

      await umzug.down({
        to: executedMigrations[executedMigrations.length - 1].name,
      }); // Revert the last executed migration
      this.logger.log('Last migration reverted successfully.');
    } catch (error) {
      this.logger.error('Error reverting migration:', error);
    }
  }
}
