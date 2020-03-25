import fs from "fs";
import path from "path";
import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { StorageOptions } from 'src/config';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@shared/logger/public_api';
import { StorageEngine } from './engines/storage.engine';
import { LocalStorageEngine } from './engines/local-storage.engine';
import { promisify } from "util";

@Module({
  exports: [
    StorageEngine,
  ],
  providers: [
    {
      inject: [ConfigService, ModuleRef, LoggerService],
      provide: StorageEngine,
      useFactory: (configService: ConfigService, moduleRef: ModuleRef, logger: LoggerService) => {
        const storageOptions = configService.get<StorageOptions>('storage');
        if(storageOptions.engine.type === 'local') {
          return new LocalStorageEngine(moduleRef, configService);
        } else if(storageOptions.engine.type === 'minio') {
          // return new DriveEngineMinioService(moduleRef, configService);
        } else {
          logger.error(`unknow drive engine: ${ storageOptions.engine }`, 'DriveModule');
          process.exit(400);
        }
      },
    },
  ],
})
export class StorageEngineModule implements OnModuleInit {

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
  if(storageOptions.engine.type === 'local') {
    const root = storageOptions.engine.root;
    const filesPath = path.join(root, 'files');

    if(!await promisify(fs.exists)(root)) {
      this.logger.error('drive root directory does not exists');
      process.exit(400);
    }
    const stat = await promisify(fs.stat)(root)
    if(!stat.isDirectory()) {
      this.logger.error('drive root is not a directory');
      process.exit(401);
    }
    // 创建files文件夹
    if(!await promisify(fs.exists)(filesPath)) {
      this.logger.warn(`creating files directory: ${ filesPath }`);
      await promisify(fs.mkdir)(filesPath);
    }
  }
}

}
