import config from '../config';
import { Module } from '@nestjs/common';
import { AuthModule } from '@auth';
import { UserModule } from '@user';
import { DriveModule } from '@drive';
import { LoggerModule } from '@shared/logger/public_api';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '@shared';

@Module({
  imports: [
    AuthModule,
    UserModule,
    DriveModule,
    LoggerModule,
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get<string>('typeorm.host'),
          port: configService.get<number>('typeorm.port'),
          logging: configService.get<LoggerOptions>('typeorm.logging'),
          database: configService.get<string>('typeorm.database'),
          username: configService.get<string>('typeorm.username'),
          password: configService.get<string>('typeorm.password'),
          synchronize: configService.get<boolean>('typeorm.synchronize'),
          autoLoadEntities: true,
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {

}
