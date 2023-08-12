import { Module } from '@nestjs/common';
import { BooksModule } from './books/books.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MigrationService } from './migrate.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BooksModule,
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const config: any = {
          dialect: 'mysql',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          models: [],
        };
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [MigrationService],
})
export class AppModule {}
