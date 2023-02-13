import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'
import { isRegExp } from 'util/types'

export class SignInDto {
  @IsNotEmpty()
  username!: string

  @IsString()
  @IsNotEmpty()
  password!: string
}

export class SignUpDto {
  @IsEmail()
  email!: string

  @MinLength(3)
  @MaxLength(20)
  username!: string

  @Matches(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/, {
    message:
      'Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @IsNotEmpty()
  password!: string
}
