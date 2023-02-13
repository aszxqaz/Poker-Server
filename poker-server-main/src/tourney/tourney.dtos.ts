import { Speed, TourneyType } from '@prisma/client'
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MinLength } from 'class-validator'

export class CreateSngDto {
  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  buyin: number

  @MinLength(5)
  @IsString()
  name: string

  @IsPositive()
  @IsNumber()
  count: number

  @IsInt({ each: true })
  @IsArray()
  prizes: number[]

  @IsEnum(Speed)
  speed: Speed

  @IsEnum(TourneyType)
  type: TourneyType
}

export class UpdateSngDto {
  @IsPositive()
  @IsNumber()
  @IsOptional()
  buyin: number

  @MinLength(5)
  @IsString()
  @IsOptional()
  name: string

  @IsPositive()
  @IsNumber()
  @IsOptional()
  count: number

  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  prizes: number[]

  @IsEnum(Speed)
  @IsOptional()
  speed: Speed
}