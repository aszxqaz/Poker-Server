import { Module, Global } from '@nestjs/common'
import { Emitter } from './emitter'

@Global()
@Module({
  providers: [Emitter],
  exports: [Emitter]
})
export class EventModule {}
