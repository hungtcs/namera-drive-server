import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ThumbnailService } from './thumbnail.service';
import { ThumbnailProcessor } from './thumbnail.processor';
import { StorageModule } from '@storage';

@Global()
@Module({
  imports: [
    StorageModule,
    BullModule.registerQueue({
      name: 'thumbnail',
      redis: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
  ],
  exports: [
    ThumbnailService,
  ],
  providers: [
    ThumbnailService,
    ThumbnailProcessor,
  ],
})
export class QueuesModule {


}
