import { ApiProperty } from "@nestjs/swagger";

export class FileUploadDTO {

  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  public file: Array<File>;

}
