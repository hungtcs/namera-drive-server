import { ReadStream } from 'fs';

export interface MulterFile {
  path: string;
  size: number;
  filename: string;
  fieldname: string;
  originalname: string;
  modifyTime: Date;
  encoding: string;
  mimetype: string;
  stream?: ReadStream;
}
