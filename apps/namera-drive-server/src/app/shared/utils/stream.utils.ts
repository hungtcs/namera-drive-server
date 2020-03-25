import { Readable } from 'stream';

export class StreamUtils {

  public static readAsString(readable: Readable) {
    return new Promise<string>((resolve, reject) => {
      const buffers: Array<Buffer> = [];
      readable.on('data', chunk => {
        buffers.push(Buffer.from(chunk));
      });
      readable.on('end', () => {
        resolve(Buffer.concat(buffers).toString('utf-8'));
      });
      readable.on('error', err => reject(err));
    });
  }

}
