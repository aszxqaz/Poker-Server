import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { BalanceService } from './balance.service'

@Module({
  imports: [],
  providers: [BalanceService],
  exports: [BalanceService]
})
export class BalanceModule {}
