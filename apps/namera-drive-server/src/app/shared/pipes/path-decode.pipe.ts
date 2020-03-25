import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PathDecodePipe implements PipeTransform {

  public transform(value: string, metadata: ArgumentMetadata) {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

}
