import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignUpEntity {

  @IsEmail()
  @ApiProperty({ title: '电子邮件' })
  public email: string;

  @IsNotEmpty()
  @ApiProperty({ title: '用户名' })
  public username: string;

  @IsNotEmpty()
  @ApiProperty({ title: '密码' })
  public password: string;

}
