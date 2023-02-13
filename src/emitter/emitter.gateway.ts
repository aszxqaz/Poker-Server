import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Namespace } from 'socket.io'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { SocketWithUser } from 'src/types'

export type EmitPayload = {
  username: string | string[]
  message: string
  payload: any
}

@WebSocketGateway()
export class EmitterGateway implements OnGatewayConnection {
  @WebSocketServer() io!: Namespace
  private socketIdsMap = new Map<string, string>()
  private logger = new Logger(EmitterGateway.name)

  async handleConnection(socket: SocketWithUser) {
    if (!socket.request.user) {
      this.logger.debug(`Socket ${socket.id} not authorized`)
      socket.disconnect()
      return
    }
    const { username } = socket.request.user
    this.logger.debug(`Socket ${username} connected`)

    this.setSocketId(username, socket.id)
  }

  @SubscribeMessage('ping')
  pong(@ConnectedSocket() socket: SocketWithUser) {
    this.logger.debug(`Pong message emitted`)
    socket.emit('pong')
  }

  @OnEvent('some')
  handleSome({ message, payload, username }: EmitPayload) {
    const socketId = this.getSocketId(username)
    this.logger.debug(`Emitting to users: ${username} (socketId: ${socketId}), message: ${message}`)
    if (!socketId || !socketId.length) return
    this.io.to(socketId).emit(message, payload)
  }

  @OnEvent('all')
  handleAll({ message, payload }: Omit<EmitPayload, 'username'>) {
    this.io.emit(message, payload)
  }

  private setSocketId(username: string, socketId: string) {
    this.socketIdsMap.set(username, socketId)
  }

  private getSocketId(usernames: string | string[]) {

    if (typeof usernames === 'object') {
      let socketIds: string[] = []
      for (const username of usernames) {
        const socketId = this.socketIdsMap.get(username)
        if (socketId) {
          socketIds.push(socketId)
        }
      }
      return socketIds
    }

    return this.socketIdsMap.get(usernames)
  }
}
