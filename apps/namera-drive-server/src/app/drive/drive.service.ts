import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from '@user';
import { StorageEngine, FileStat } from '@storage-engine';
import { MulterFile } from '../multer-storage/public_api';
import { TrashInfo } from './entities/trash-info';
import { classToPlain, plainToClass } from 'class-transformer';
import { FileUtils, StreamUtils } from '@shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DriveService {

  constructor(
      private readonly configService: ConfigService,
      private readonly storageEngine: StorageEngine) {

  }

  public async getFiles(user: UserEntity, dirpath: string) {
    return await this.storageEngine.list(user, dirpath);
  }

  public async getFileStat(user: UserEntity, filepath: string) {
    return await this.storageEngine.stat(user, filepath);
  }

  public async isFileExists(user: UserEntity, filepath: string) {
    return await this.storageEngine.exists(user, filepath);
  }

  public async createDirectory(user: UserEntity, dirpath: string): Promise<FileStat> {
    const stat = await this.storageEngine.mkdir(user, dirpath, false);
    return stat;
  }

  public async downloadFile(user: UserEntity, filepath: string): Promise<fs.ReadStream> {
    return await this.storageEngine.readFile(user, filepath);
  }

  public async uploadFiles(user: UserEntity, destination: string, files: Array<MulterFile>): Promise<Array<FileStat>> {
    try {
      const exists = await this.isFileExists(user, destination);
      if(!exists) {
        this.storageEngine.mkdir(user, destination, true);
      }
      return await Promise.all(
        files.map(file => {
          return this.storageEngine.moveFile(user, file.path, path.join(destination, file.originalname));
        }),
      );
    } catch(error) {
      await Promise.all(files.map(file => this.deleteFile(user, file.path, false, true)));
      throw error;
    }
  }

  public async deleteFile(user: UserEntity, filepath: string,
      recursive: boolean = false,
      ignoreIfNotExists: boolean = false) {
    if(await this.isFileExists(user, filepath)) {
      return await this.storageEngine.deleteFile(user, filepath, recursive);
    } else {
      if(!ignoreIfNotExists) {
        throw new NotFoundException(`file(${ filepath }) not found`);
      }
    }
  }

  public async removeFile(user: UserEntity, filepath: string) {
    const trashPath = this.configService.get<string>(`storage.trashPath`);
    if(!await this.storageEngine.exists(user, trashPath)) {
      await this.storageEngine.mkdir(user, trashPath, true);
    }

    const fileStat = await this.storageEngine.stat(user, filepath);
    const filename = FileUtils.generateRandomFilename();
    const trashInfo = new TrashInfo({
      filepath,
      fileType: fileStat.type,
      deleteDate: new Date(),
    });
    await this.storageEngine.writeFile(
      user,
      path.join(trashPath, `${ filename }.info`),
      fs.ReadStream.from(yaml.stringify(classToPlain(trashInfo))),
    );
    return await this.storageEngine.moveFile(user, filepath, path.join(trashPath, filename));
  }

  public async restoreTrash(user: UserEntity, trashId: string) {
    const trashPath = this.configService.get<string>(`storage.trashPath`);
    const readStream = await this.storageEngine.readFile(user, path.join(trashPath, `${ trashId }.info`));
    const plainTrashInfo = await StreamUtils.readAsString(readStream);
    const trashInfo = plainToClass(TrashInfo, yaml.parse(plainTrashInfo));

    if(trashInfo.isFile()) {
      if(!await this.storageEngine.exists(user, path.dirname(trashInfo.filepath))) {
        await this.storageEngine.mkdir(user, path.dirname(trashInfo.filepath), true);
      }
      await this.storageEngine.moveFile(user, path.join(trashPath, trashId), trashInfo.filepath);
    } else if(trashInfo.isDirectory()) {
      if(!await this.storageEngine.exists(user, trashInfo.filepath)) {
        await this.storageEngine.moveFile(user, path.join(trashPath, trashId), trashInfo.filepath);
      } else {
        await this.storageEngine.moveFile(user, path.join(trashPath, trashId), `${ trashInfo.filepath }-${ trashId }`);
      }
    }

    await this.storageEngine.deleteFile(user, path.join(trashPath, `${ trashId }.info`), false);

    return trashInfo;
  }

}
