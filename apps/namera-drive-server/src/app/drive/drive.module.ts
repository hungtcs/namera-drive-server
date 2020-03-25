import { Module } from '@nestjs/common';
import { DriveService } from './drive.service';
import { MulterModule } from '@nestjs/platform-express';
import { DriveController } from './drive.controller';
import { StorageEngineModule } from '@storage-engine';
import { MulterStorage, MulterStorageModule } from '@multer-storage';

@Module({
  imports: [
    StorageEngineModule,
    MulterModule.registerAsync({
      inject: [MulterStorage],
      imports: [MulterStorageModule],
      useFactory: (storage: MulterStorage) => {
        return { storage };
      },
    }),
  ],
  providers: [
    DriveService,
  ],
  controllers: [
    DriveController,
  ],
})
export class DriveModule {

}
