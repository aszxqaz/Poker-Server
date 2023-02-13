import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import { RequestWithUser } from 'src/session/types'

export type SocketMiddleware = (socket: Socket, next: (err?: ExtendedError | undefined) => void) => void

export type SocketWithUser = Socket & {
  request: RequestWithUser
}