import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as RedisStore from 'connect-redis'
import * as session from 'express-session'
import Redis from 'ioredis'
import { REDIS } from 'src/redis/redis.module'

export const SESSION = Symbol('SESSION')

export const sessionProvider: Provider = {
  provide: SESSION,
  useFactory: (redis: Redis, configService: ConfigService) =>
    session({
      store: new (RedisStore(session))({
        client: redis,
        logErrors: true,
      }),
      name: configService.get('SESSION_COOKIE_NAME') as string,
      secret: configService.get('SESSION_COOKIE_SECRET') as string,
      resave: false,
      saveUninitialized: false,
    
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        // httpOnly: configService.get('NODE_ENV') === 'production' ? true : false,
        httpOnly: true,
        sameSite: false,
        // secure: configService.get('NODE_ENV') === 'production' ? true : false
      },
      rolling: true,
    }),
  inject: [REDIS, ConfigService],
}
