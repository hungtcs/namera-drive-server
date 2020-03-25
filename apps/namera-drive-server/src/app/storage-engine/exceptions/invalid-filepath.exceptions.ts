import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidFilepathException extends HttpException {

  constructor(objectOrError?: string | object | any, message = 'InvalidFilepath') {
    super(
      HttpException.createBody(objectOrError, message, HttpStatus.FORBIDDEN),
      HttpStatus.FORBIDDEN,
    );
  }

}
