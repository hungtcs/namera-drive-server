import fs from 'fs';
import { Request } from "express";
import { ApiProperty } from "@nestjs/swagger";
import { StorageOptions } from "src/config";
import { StorageEngine } from '@storage-engine';

export interface MulterStorageOptions {
  storageOptions: StorageOptions,
}

export abstract class MulterStorage {

  constructor(
      protected readonly options: MulterStorageOptions,
      protected readonly storageEngine: StorageEngine) {

  }

  public abstract _handleFile(request: Request, file: MulterFile, callback: Function): void;
  public abstract _removeFile(request: Request, file: MulterFile, callback: Function): void;

}

export class FileUploadDTO {

  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  public file: Array<File>;

}

export interface MulterFile {
  path: string;
  size: number;
  filename: string;
  fieldname: string;
  originalname: string;
  modifyTime: Date;
  encoding: string;
  mimetype: string;
  stream?: fs.ReadStream;
}
