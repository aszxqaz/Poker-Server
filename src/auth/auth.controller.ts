import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { PublicRoute } from 'src/common/decorators'
import { LocalGuard } from 'src/common/guards'
import { RequestWithUser } from 'src/session/types'
import { SignUpDto } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('signup')
  @PublicRoute()
  @HttpCode(HttpStatus.OK)
  public async signup(@Body() dto: SignUpDto) {
    const user = await this.authService.signup(dto)
  }

  @Post('signin')
  @PublicRoute()
  @UseGuards(LocalGuard)
  @HttpCode(HttpStatus.OK)
  public async signin(@Req() req: RequestWithUser) {
    return {
      user: {
        username: req.user.username,
        avatar: req.user.avatar
      },
      balance: req.user.balance
    }
  }

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  public async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    req.session.destroy(() => {})
  }

  @Get('me')
  @PublicRoute()
  public async me(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Not authorized')
    }
    const { avatar, usd, username } = await this.authService.getUserInfo(
      req.user.username
    )

    return {
      user: {
        username,
        avatar
      },
      balance: {
        usd
      }
    }
  }
}
