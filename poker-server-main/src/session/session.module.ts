import { Module } from '@nestjs/common'
import { redisModule } from 'src/redis/redis.module'
import { sessionProvider } from './session.provider'

@Module({
  imports: [redisModule],
  providers: [sessionProvider],
  exports: [sessionProvider]
})
export class SessionModule {}
