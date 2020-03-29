import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { StorageEngineModule } from '@storage-engine';

@Module({
  imports: [
    StorageEngineModule,
  ],
  controllers: [
    MediaController,
  ],
})
export class MediaModule {

}
