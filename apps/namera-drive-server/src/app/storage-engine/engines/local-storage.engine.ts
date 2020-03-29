import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf'
import mimeTypes from 'mime-types';
import { FileStat } from '../entities/public_api';
import { FileType } from '../enums/public_api';
import { promisify } from 'util';
import { UserEntity } from '@user';
import { Injectable } from '@nestjs/common';
import { StorageEngine } from './storage.engine';
import { StorageOptions, LocalStorageEngineOptions } from 'src/config';
import { InvalidFilepathException } from '@storage-engine/exceptions/public_api';

@Injectable()
export class LocalStorageEngine extends StorageEngine {

  private get storageOptions() {
    return this.configService.get<StorageOptions<LocalStorageEngineOptions>>('storage');
  }

  private get storageRoot() {
    return this.storageOptions.engine.root;
  }
  private get storageFilesRoot() {
    return path.join(this.storageRoot, 'files');
  }

  public async initUser(user: UserEntity): Promise<void> {
    const exists = await promisify(fs.exists)(this.getUserFileRoot(user));
    if(!exists) {
      await promisify(fs.mkdir)(this.getUserFileRoot(user));
    }
  }

  public async list(user: UserEntity, filepath: string): Promise<Array<FileStat>> {
    const files = await promisify(fs.readdir)(this.getUserFilePath(user, filepath));
    return await Promise.all(files.map(file => this.stat(user, path.join(filepath, file))));
  }

  public async stat(user: UserEntity, filepath: string) {
    const stat = await promisify(fs.stat)(this.getUserFilePath(user, filepath));
    return new FileStat({
      name: path.basename(filepath),
      fullpath: filepath,
      size: stat.size,
      type: stat.isFile() ? FileType.FILE :
              (stat.isDirectory() ? FileType.DIRECTORY :
                (stat.isSymbolicLink() ? FileType.SYMBOLIC_LINK :
                  FileType.UNKNOW)),
      mimeType: stat.isDirectory() ? 'inode/directory' :
                  (stat.isSymbolicLink() ? 'inode/symlink' :
                    (mimeTypes.lookup(filepath) || 'application/octet-stream')),
      modifyTime: stat.mtime,
    });
  }

  public async exists(user: UserEntity, filepath: string) {
    return await promisify(fs.exists)(this.getUserFilePath(user, filepath));
  }

  public async mkdir(user: UserEntity, dirpath: string, recursive: boolean = false): Promise<FileStat> {
    await promisify(fs.mkdir)(path.join(this.getUserFileRoot(user), dirpath), { recursive })
    return this.stat(user, dirpath);
  }

  public async readFile(user: UserEntity, filepath: string): Promise<fs.ReadStream> {
    return fs.createReadStream(this.getUserFilePath(user, filepath));
  }

  public async writeFile(user: UserEntity, filepath: string, stream: fs.ReadStream): Promise<FileStat> {
    const writeStream = fs.createWriteStream(this.getUserFilePath(user, filepath));
    stream.pipe(writeStream);
    await new Promise((resolve, reject) => {
      writeStream.on('error', (err) => {
        reject(err);
      });
      writeStream.on('finish', () => {
        resolve();
      });
    });
    return await this.stat(user, filepath);
  }

  public async deleteFile(user: UserEntity, filepath: string, recursive: boolean): Promise<FileStat> {
    const fileStat = await this.stat(user, filepath);
    if(recursive) {
      await promisify(rimraf)(this.getUserFilePath(user, filepath));
    } else {
      if(fileStat.isFile() || fileStat.isSymbolicLink()) {
        await promisify(fs.unlink)(this.getUserFilePath(user, filepath));
      } else if(fileStat.isDirectory) {
        await promisify(fs.rmdir)(this.getUserFilePath(user, filepath));
      }
    }
    return fileStat;
  }

  public async moveFile(user: UserEntity, sourceFile: string, targetFile: string): Promise<FileStat> {
    await promisify(fs.rename)(
      this.getUserFilePath(user, sourceFile),
      this.getUserFilePath(user, targetFile),
    );
    return await this.stat(user, targetFile);
  }

  public async moveFiles(user: UserEntity, sourceFiles: Array<string>, targetDirectory: string): Promise<Array<FileStat>> {
    const tasks = sourceFiles.map(sourceFile => {
      return this.moveFile(user, sourceFile, path.join(targetDirectory, path.basename(sourceFile)));
    });
    return await Promise.all(tasks);
  }

  public async getAbsolutePath(user: UserEntity, filepath: string): Promise<string> {
    return this.getUserFilePath(user, filepath);
  }

  private getUserFileRoot(user: UserEntity) {
    return path.join(this.storageFilesRoot, user.username);
  }

  public getUserFilePath(user: UserEntity, ...filepath: Array<string>) {
    const userFileRoot = this.getUserFileRoot(user);
    const relativePath = path.relative(userFileRoot, path.join(this.getUserFileRoot(user), ...filepath));
    if(relativePath.startsWith('../')) {
      throw new InvalidFilepathException();
    }
    return path.join(this.getUserFileRoot(user), ...filepath);
  }

}
