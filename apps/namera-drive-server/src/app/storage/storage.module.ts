import fs from "fs";
import path from "path";
import { promisify } from "util";
import { LocalStorage } from './local.storage';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@shared/logger/public_api';
import { StorageOptions } from 'src/config';
import { Module, OnModuleInit } from '@nestjs/common';

@Module({
  exports: [
    LocalStorage,
  ],
  providers: [
    LocalStorage,
  ],
})
export class StorageModule implements OnModuleInit {

  constructor(
      private readonly logger: LoggerService,
      private readonly configService: ConfigService) {
    this.logger.setContext('StorageEngineModule');
  }

  public async onModuleInit() {
    await this.checkDriveRootDirectory();
  }

  private async checkDriveRootDirectory() {
    const storageOptions = this.configService.get<StorageOptions>('storage');
    const root = storageOptions.root;
    if(!await promisify(fs.exists)(root)) {
      this.logger.error('drive root directory does not exists');
      process.exit(400);
    }
    const stat = await fs.promises.stat(root)
    if(!stat.isDirectory()) {
      this.logger.error('drive root is not a directory');
      process.exit(401);
    }
    const filesPath = path.join(root, 'files');
    if(!await promisify(fs.exists)(filesPath)) {
      this.logger.warn(`creating files directory: ${ filesPath }`);
      await promisify(fs.mkdir)(filesPath);
    }
  }

}
