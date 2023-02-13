import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { TableModule } from 'src/table/table.module'
import { CashGateway } from './cash.gateway'
import { CashService } from './cash.service'

@Module({
  imports: [TableModule],
  providers: [CashService, CashGateway]
})
export class CashModule {}
