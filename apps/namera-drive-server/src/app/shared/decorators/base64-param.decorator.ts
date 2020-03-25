import { PathDecodePipe } from '../pipes/public_api';
import { Param, Type, PipeTransform } from '@nestjs/common';

/**
 * 自动解码base64编码
 * @param property
 * @param pipes
 */
export const Base64Param = (property: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]) => {
  return Param(property, new PathDecodePipe(), ...pipes);
}
