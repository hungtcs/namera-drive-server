import { Module } from '@nestjs/common';
import { MulterStorage } from './multer-storages/multer-storage';
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from 'src/config';
import { LocalMulterStorage } from './multer-storages/local.multer-storage';
import { StorageEngineModule, StorageEngine } from '@storage-engine';

@Module({
  imports: [
    StorageEngineModule,
  ],
  exports: [
    MulterStorage,
  ],
  providers: [
    {
      provide: MulterStorage,
      inject: [ConfigService, StorageEngine],
      useFactory: (configService: ConfigService, storageEngine: StorageEngine) => {
        const storageOptions = configService.get<StorageOptions>('storage')
        if(storageOptions.engine.type === 'local') {
          return new LocalMulterStorage({ storageOptions }, storageEngine);
        } else if(storageOptions.engine.type === 'minio') {

        } else {

        }
      },
    },
  ],
})
export class MulterStorageModule {

}
