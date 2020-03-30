import { DateUtils } from "@shared";
import { Transform } from "class-transformer";
import { FileType } from "src/app/storage/public_api";

export class TrashInfo {

  public fileType: FileType;

  public filepath: string;

  @Transform(value => DateUtils.parse(value), { toClassOnly: true })
  @Transform(value => DateUtils.format(value), { toPlainOnly: true })
  public deleteDate: Date;

  constructor(that: Partial<TrashInfo> = {}) {
    Object.assign(this, that);
  }

  public isFile() {
    return this.fileType === FileType.FILE;
  }

  public isDirectory() {
    return this.fileType === FileType.DIRECTORY;
  }

}
