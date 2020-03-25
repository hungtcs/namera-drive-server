import { FileType } from "../enums/public_api";
import { ApiProperty } from "@nestjs/swagger";

export class FileStat {

  @ApiProperty({ title: '文件名称' })
  public name: string;

  @ApiProperty({ title: '文件路径' })
  public fullpath: string;

  @ApiProperty({ title: '文件大小' })
  public size: number;

  @ApiProperty({ title: '文件类型', enum: FileType, enumName: '文件类型' })
  public type: FileType;

  @ApiProperty({ title: '媒体类型' })
  public mimeType: string;

  @ApiProperty({ title: '修改日期' })
  public modifyTime: Date;

  constructor(that: Partial<FileStat> = {}) {
    Object.assign(this, that);
  }

  public isFile() {
    return this.type === FileType.FILE;
  }

  public isDirectory() {
    return this.type === FileType.DIRECTORY;
  }

  public isSymbolicLink() {
    return this.type === FileType.SYMBOLIC_LINK;
  }

}
