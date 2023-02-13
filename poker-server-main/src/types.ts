import { Request } from 'express'
import { Socket } from 'socket.io'

export type UserInRequest = {
  username: string
}

export type RequestWithUser = Request & {
  user: UserInRequest
}

export type SocketWithUser = Socket & {
  request: RequestWithUser
}

