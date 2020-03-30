import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { StorageModule } from 'src/app/storage/public_api';

@Module({
  imports: [
    StorageModule,
  ],
  controllers: [
    MediaController,
  ],
})
export class MediaModule {

}
