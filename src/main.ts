import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import * as cookieParser from 'cookie-parser'
import { NextFunction, Request, Response } from 'express'
import * as passport from 'passport'
import 'reflect-metadata'
import { AppModule } from './app.module'
import { PrismaService } from './prisma/prisma.service'
import { seedCash } from './prisma/seed/cash'
import { seedSngs } from './prisma/seed/sng'
import { SESSION } from './session/session.provider'
import { SocketIOAdapter } from './socket/adapter'

const path = require('path')

declare const module: any

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  const prismaService = app.get(PrismaService)
  const session = app.get(SESSION)

  const CLIENT_URL =
    configService.get('NODE_ENV') === 'production'
      ? configService.get('CLIENT_URL_PROD')
      : configService.get('CLIENT_URL_DEV')

  app.enableCors({
    origin: CLIENT_URL,
    credentials: true
  })

  if (configService.get('NODE_ENV') === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.header('x-forwarded-proto') !== 'https') res.redirect(`https://${req.header('host')}${req.url}`)
      else next()
    })
  }
  app.use(cookieParser(configService.get('SESSION_COOKIE_SECRET')))
  app.use(session)
  app.use(passport.initialize())
  app.use(passport.session())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  )

  app.useWebSocketAdapter(new SocketIOAdapter(app, configService))

  app.useStaticAssets(path.join(__dirname, '..', 'public'))
  app.setViewEngine('html')

  await prismaService.enableShutdownHooks(app)

  await prismaService.tourney.deleteMany()
  await seedSngs(prismaService)

  await prismaService.player.deleteMany()
  await prismaService.cashTable.deleteMany()
  await prismaService.table.deleteMany()
  await seedCash(prismaService)

  await app.listen(process.env.PORT || 3000)
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}

bootstrap()
