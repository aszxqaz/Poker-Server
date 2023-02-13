import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EmitPayload } from 'src/emitter/emitter.gateway'

@Injectable()
export class Emitter {
  constructor(private eventEmitter: EventEmitter2) {}

  public some(payload: EmitPayload) {
    this.eventEmitter.emit('some', payload)
  }

  public all(payload: Omit<EmitPayload, 'username'>) {
    this.eventEmitter.emit('all', payload)
  }
}
