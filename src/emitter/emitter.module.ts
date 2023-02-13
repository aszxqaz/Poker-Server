import { Module } from '@nestjs/common'
import { EmitterGateway } from './emitter.gateway';

@Module({
  providers: [EmitterGateway]
})
export class EmitterModule {

}