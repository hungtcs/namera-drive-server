import config from './config';
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UserModule,
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
})
export class AppModule {

}
