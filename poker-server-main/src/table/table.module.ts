import { Module } from '@nestjs/common'
import { BalanceModule } from 'src/balance/balance.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RepositoryModule } from 'src/repository/repository.module'
import { TourneyModule } from 'src/tourney/tourney.module'
import { PlayerService } from './player.service'
import { RoundGateway } from './round.gateway'
import { SubscriberService } from './subscriber.service'
import { TableGateway as TableGateway } from './table.gateway'
import { TableService } from './table.service'
import { TimeoutService } from './timeout.service'

@Module({
  imports: [BalanceModule, RepositoryModule],
  providers: [
    TableService,
    TableGateway,
    SubscriberService,
    PlayerService,
    TimeoutService,
    RoundGateway
  ],
  exports: [
    TableService,
    TableGateway,
    SubscriberService,
    PlayerService,
    RoundGateway,
    TimeoutService
  ]
})
export class TableModule {}
