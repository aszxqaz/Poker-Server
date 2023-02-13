import { Module } from '@nestjs/common'
import { BalanceModule } from 'src/balance/balance.module'
import { PrismaModule } from 'src/prisma/prisma.module'
import { RepositoryModule } from 'src/repository/repository.module'
import { TableModule } from 'src/table/table.module'
import { TransformModule } from 'src/transform/transform.module'
import { TourneyGateway } from './tourney.gateway'
import { TourneyService } from './tourney.service'


@Module({
  imports: [TableModule, TransformModule, BalanceModule, RepositoryModule],
  providers: [TourneyService, TourneyGateway]
})
export class TourneyModule {}
