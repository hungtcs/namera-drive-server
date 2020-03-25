import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((_data: void, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
