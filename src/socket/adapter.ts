import { INestApplication, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import * as passport from 'passport'
import { ServerOptions, Socket, Server } from 'socket.io'
import { SESSION } from 'src/session/session.provider'

export class SocketIOAdapter extends IoAdapter {
  private logger = new Logger(SocketIOAdapter.name)
  constructor(
    private app: INestApplication,
    private configService: ConfigService,
  ) {
    super(app)
  }

  createIOServer(port: number, options: ServerOptions) {
    const clientUrl =
      this.configService.get('NODE_ENV') === 'production'
        ? this.configService.get('CLIENT_URL_PROD')
        : this.configService.get('CLIENT_URL_DEV')

    const optionsWithCORS: ServerOptions = {
      ...options,
      cors: {
        origin: clientUrl,
        credentials: true,
      },
      pingInterval: 1000
    }

    const server: Server = super.createIOServer(port, optionsWithCORS)

    const session = this.app.get(SESSION)
    server.use(wrap(session))
    server.use(wrap(passport.initialize()))
    server.use(wrap(passport.session()))

    this.logger.log('SocketIO server middlewares applied.')

    return server
  }
}

const wrap = (middleware: RequestHandler) => (socket: Socket, next: Function) =>
  middleware(socket.request as Request, {} as Response, next as NextFunction)
