import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { UserEntity } from '@user';
import { TrashInfo } from './entities/trash-info';
import { ConfigService } from '@nestjs/config';
import { StorageOptions } from 'src/config';
import { LocalStorage, FileStat } from '@storage';
import { classToPlain, plainToClass } from 'class-transformer';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FileUtils, StreamUtils, MulterFile } from '@shared';
import { ThumbnailService } from '../queues/thumbnail.service';
import { async } from 'rxjs/internal/scheduler/async';

@Injectable()
export class DriveService {

  constructor(
      private readonly localStorage: LocalStorage,
      private readonly configService: ConfigService,
      private readonly thumbnailService: ThumbnailService) {

  }

  public async getFiles(user: UserEntity, dirpath: string) {
    const files = await this.localStorage.list(user, dirpath);
    return files.filter(file => !file.name.startsWith('.'));
  }

  public async getFileStat(user: UserEntity, filepath: string) {
    return await this.localStorage.stat(user, filepath);
  }

  public async createDirectory(user: UserEntity, dirpath: string): Promise<FileStat> {
    if(await this.localStorage.exists(user, dirpath)) {
      throw new ConflictException(`dir(${ dirpath }) exists`);
    }
    const stat = await this.localStorage.mkdir(user, dirpath, false);
    return stat;
  }

  public async moveFile(user: UserEntity, sourcepath: string, targetpath: string) {
    if(await this.localStorage.exists(user, targetpath)) {
      throw new ConflictException(`target(${ targetpath }) exists`);
    }
    return await this.localStorage.moveFile(user, sourcepath, targetpath);
  }

  public async downloadFile(user: UserEntity, filepath: string): Promise<fs.ReadStream> {
    return await this.localStorage.readFile(user, filepath);
  }

  public async uploadFiles(user: UserEntity, destination: string, files: Array<MulterFile>): Promise<Array<FileStat>> {
    try {
      return await Promise.all(
        files.map(async file => {
          return await this.localStorage.moveFile(user, file.path, path.join(destination, file.originalname));
        }),
      ).then(files => {
        files.forEach(file => {
          if(/image\/*/.test(file.mimeType)) {
            this.thumbnailService.addJob(user, file);
          } else if(/video\/*/.test(file.mimeType)) {
            this.thumbnailService.addJob(user, file);
          }
        });
        return files;
      });
    } catch(error) {
      await Promise.all(files.map(file => this.deleteFile(user, file.path, false, true)));
      throw error;
    }
  }

  public async deleteFile(user: UserEntity, filepath: string,
      recursive: boolean = false,
      ignoreIfNotExists: boolean = false) {
    if(await this.localStorage.exists(user, filepath)) {
      return await this.localStorage.deleteFile(user, filepath, recursive);
    } else {
      if(!ignoreIfNotExists) {
        throw new NotFoundException(`file(${ filepath }) not found`);
      }
    }
  }

  public async deleteFiles(user: UserEntity, filepaths: Array<string>,
      recursive: boolean = false,
      ignoreIfNotExists: boolean = false) {
    return await Promise.all(
      filepaths.map(async filepath => {
        if(await this.localStorage.exists(user, filepath)) {
          return await this.localStorage.deleteFile(user, filepath, recursive);
        } else {
          if(!ignoreIfNotExists) {
            throw new NotFoundException(`file(${ filepath }) not found`);
          } else {
            return await Promise.resolve(null);
          }
        }
      }),
    );
  }

  public async removeFile(user: UserEntity, filepath: string) {
    const { trashPath } = this.configService.get<StorageOptions>(`storage`);
    if(!await this.localStorage.exists(user, trashPath)) {
      await this.localStorage.mkdir(user, trashPath, true);
    }
    const fileStat = await this.localStorage.stat(user, filepath);
    const filename = FileUtils.generateRandomFilename();
    const trashInfo = new TrashInfo({
      filepath,
      fileType: fileStat.type,
      deleteDate: new Date(),
    });
    await this.localStorage.writeFile(
      user,
      path.join(trashPath, `${ filename }.info`),
      fs.ReadStream.from(yaml.stringify(classToPlain(trashInfo))),
    );
    return await this.localStorage.moveFile(user, filepath, path.join(trashPath, filename));
  }

  public async removeFiles(user: UserEntity, filepaths: Array<string>) {
    return await Promise.all(filepaths.map(filepath => this.removeFile(user, filepath)));
  }

  public async restoreTrash(user: UserEntity, trashId: string) {
    const trashPath = this.configService.get<string>(`storage.trashPath`);
    const readStream = await this.localStorage.readFile(user, path.join(trashPath, `${ trashId }.info`));
    const plainTrashInfo = await StreamUtils.readAsString(readStream);
    const trashInfo = plainToClass(TrashInfo, yaml.parse(plainTrashInfo));

    if(trashInfo.isFile()) {
      if(!await this.localStorage.exists(user, path.dirname(trashInfo.filepath))) {
        await this.localStorage.mkdir(user, path.dirname(trashInfo.filepath), true);
      }
      await this.localStorage.moveFile(user, path.join(trashPath, trashId), trashInfo.filepath);
    } else if(trashInfo.isDirectory()) {
      if(!await this.localStorage.exists(user, trashInfo.filepath)) {
        await this.localStorage.moveFile(user, path.join(trashPath, trashId), trashInfo.filepath);
      } else {
        await this.localStorage.moveFile(user, path.join(trashPath, trashId), `${ trashInfo.filepath }-${ trashId }`);
      }
    }

    await this.localStorage.deleteFile(user, path.join(trashPath, `${ trashId }.info`), false);

    return trashInfo;
  }

}
