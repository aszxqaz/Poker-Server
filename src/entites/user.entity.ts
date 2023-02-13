import { User } from "@prisma/client"
import { IsEmail, IsUUID, MaxLength, MinLength } from "class-validator"

export class UserEntity implements User {
  @IsUUID()
  id: string

  @IsEmail()
  email: string

  @MinLength(3)
  @MaxLength(20)
  username: string

  @MinLength(8)
  password: string

  avatar: string
}
