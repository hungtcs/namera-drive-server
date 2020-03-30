import { Queue } from 'bull';
import { UserEntity } from '@user';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { FileStat, LocalStorage } from '../storage/public_api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThumbnailService {

  constructor(
      private readonly storage: LocalStorage,
      private readonly configService: ConfigService,
      @InjectQueue('thumbnail') private readonly thumbnailQueue: Queue) {

  }

  public async addJob(user: UserEntity, file: FileStat) {
    const thumbnailsPath = this.configService.get<string>('storage.thumbnailsPath');
    if(!await this.storage.exists(user, thumbnailsPath)) {
      await this.storage.mkdir(user, thumbnailsPath);
    }
    await this.thumbnailQueue.add({
      file,
      absolutePath: await this.storage.getAbsolutePath(user, file.fullpath),
      thumbnailsPath: this.storage.getUserFilePath(user, thumbnailsPath),
    });
  }


}
