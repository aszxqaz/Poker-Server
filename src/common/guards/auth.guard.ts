import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Request } from 'express'
import { AuthService } from 'src/auth/auth.service'

@Injectable()
export class CustomSocketGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>()
    return req.isAuthenticated()
  }
}

////////////////////////////////////////////////////////////////////////////
@Injectable()
export class LocalGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean
    const request = context.switchToHttp().getRequest()
    await super.logIn(request)
    return result
  }
}

////////////////////////////////////////////////////////////////////////////
@Injectable()
export class AccessTokenGuard extends AuthGuard('access_token_strategy') {
  constructor(private reflector: Reflector, private readonly authService: AuthService) {
    super()
  }

  // async canActivate(context: ExecutionContext) {
  //   const req = context.switchToHttp().getRequest<Request>()
  //   const socket = context.switchToWs().getClient<Socket & {user: any}>()

  //   const isPublic = this.reflector.getAllAndOverride(METADATA_KEY_PUBLIC_ROUTE, [
  //     context.getHandler(),
  //     context.getClass(),
  //   ])

  //   if (isPublic) return true

  //   const isAllowed = await super.canActivate(context)
  //   if (isAllowed) return true

  //   const isVerifiedToken = await this.authService.verifyRefreshToken(req.signedCookies['refreshToken'])

  //   if (isVerifiedToken) return true

  //   return false
  // }
}

////////////////////////////////////////////////////////////////////////////
@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh_token_strategy') {}
