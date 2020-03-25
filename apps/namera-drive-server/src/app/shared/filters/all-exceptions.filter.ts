import { BaseExceptionFilter } from '@nestjs/core';
import { Catch, ArgumentsHost } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {

  public catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }

}
