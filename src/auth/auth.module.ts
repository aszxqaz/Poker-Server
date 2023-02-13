import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { PrismaModule } from 'src/prisma/prisma.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { LocalStrategy } from './strategies/local.strategy'
import { SessionSerializer } from './strategies/session.serializer'

@Module({
  imports: [
    PassportModule.register({
      session: true,
    }),
    PrismaModule
  ],
  providers: [
    AuthService,
    SessionSerializer,
    LocalStrategy
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
