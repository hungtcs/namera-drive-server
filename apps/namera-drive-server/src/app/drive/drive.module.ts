import { Module } from '@nestjs/common';
import { MulterModule } from '@shared';
import { DriveService } from './drive.service';
import { DriveController } from './drive.controller';
import { StorageModule } from 'src/app/storage/public_api';

@Module({
  imports: [
    MulterModule,
    StorageModule,
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
