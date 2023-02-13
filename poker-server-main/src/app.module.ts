import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ServeStaticModule } from '@nestjs/serve-static'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { CashModule } from './cash/cash.module'
import { CashierModule } from './cashier/cashier.module'
import { EmitterModule } from './emitter/emitter.module'
import { EventModule } from './event/event.module'
import { PrismaModule } from './prisma/prisma.module'
import { SessionModule } from './session/session.module'
import { TableModule } from './table/table.module'
import { TourneyModule } from './tourney/tourney.module'
import { TransformModule } from './transform/transform.module'
const path = require('path')

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public')
    }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    EventEmitterModule.forRoot(),
    EventModule,
    EmitterModule,
    PrismaModule,
    SessionModule,
    AuthModule,
    CashierModule,
    TransformModule,
    TableModule,
    TourneyModule,
    CashModule
  ],
  controllers: [AppController]
})
export class AppModule {}
