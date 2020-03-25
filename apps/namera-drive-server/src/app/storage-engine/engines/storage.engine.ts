import fs from 'fs';
import { Readable } from 'stream';
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ModuleRef } from "@nestjs/core";
import { UserEntity } from "@user";
import { FileStat } from "../entities/public_api";

@Injectable()
export abstract class StorageEngine {

  constructor(
    protected readonly moduleRef: ModuleRef,
    protected readonly configService: ConfigService) {

  }

  public abstract async initUser(user: UserEntity): Promise<void>;

  public abstract async list(user: UserEntity, filepath: string): Promise<Array<FileStat>>;

  public abstract async stat(user: UserEntity, filepath: string): Promise<FileStat>;

  public abstract async exists(user: UserEntity, filepath: string): Promise<boolean>;

  public abstract async mkdir(user: UserEntity, dirpath: string, recursive: boolean): Promise<FileStat>;

  public abstract async writeFile(user: UserEntity, filepath: string, stream: Readable): Promise<FileStat>;

  public abstract async readFile(user: UserEntity, filepath: string): Promise<fs.ReadStream>;

  public abstract async deleteFile(user: UserEntity, filepath: string, recursive: boolean): Promise<FileStat>;

  public abstract async moveFile(user: UserEntity, sourceFile: string, targetFile: string): Promise<FileStat>;

  public abstract async moveFiles(user: UserEntity, sourceFiles: Array<string>, targetDirectory: string): Promise<Array<FileStat>>;

  // public abstract async listFiles(user: UserEntity, path: string);

  // public abstract async readFile(user: UserEntity, path: string);

  // public abstract async writeFile(user: UserEntity, path: string, stream: ReadableStream);

  // public abstract async mkdir(user: UserEntity, directory: string);

}
