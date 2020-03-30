import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from 'src/config';
import { LocalMulterStorage } from './local.multer-storage';
import { LocalStorage, StorageModule } from 'src/app/storage/public_api';
import { MulterModule as ExpressMulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ExpressMulterModule.registerAsync({
      imports: [ConfigService, StorageModule],
      inject: [ConfigService, LocalStorage],
      useFactory: (config: ConfigService, storageEngine: LocalStorage) => {
        return {
          storage: new LocalMulterStorage(config.get<StorageOptions>('storage'), storageEngine),
        };
      },
    }),
  ],
  exports: [
    ExpressMulterModule,
  ],
})
export class MulterModule {


}
