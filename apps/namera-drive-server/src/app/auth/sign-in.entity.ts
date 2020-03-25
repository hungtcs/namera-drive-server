import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInEntity {

  @IsNotEmpty()
  @ApiProperty({ title: '用户名' })
  username: string;

  @IsNotEmpty()
  @ApiProperty({ title: '密码' })
  password: string;

}
