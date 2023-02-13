import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common'
import { Request } from 'express'
import { Socket } from 'socket.io'
import { RequestWithUser } from 'src/session/types'

export const METADATA_KEY_PUBLIC_ROUTE = 'METADATA_KEY_PUBLIC_ROUTE'

export const PublicRoute = () => SetMetadata(METADATA_KEY_PUBLIC_ROUTE, true)

export const Username = createParamDecorator((data: undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>()
  return request.user.username
})

export const GetUser = createParamDecorator((data: undefined, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>()
  const socket = context.switchToWs().getClient<Socket & { request: RequestWithUser }>()
  if (socket.request?.user) return socket.request.user
  return request.user
})

// export const SignedCookies = createParamDecorator((data: undefined, context: ExecutionContext) => {
//   const request = context.switchToHttp().getRequest<RequestWithUser>()
//   return request.signedCookies as { accessToken: string; refreshToken: string }
// })
