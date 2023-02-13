import { PassportSerializer } from '@nestjs/passport'

export class SessionSerializer extends PassportSerializer {
  constructor() {
    super()
  }

  serializeUser(user: any, done: Function) {
    done(null, user)
  }

  async deserializeUser(user: any, done: Function) {
    if (user) {
      return done(null, user)
    }
    done(null, null)
  }
}
