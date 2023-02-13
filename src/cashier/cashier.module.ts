import { Module } from '@nestjs/common'
import { PrismaModule } from 'src/prisma/prisma.module'
import { ThirdWebModule } from 'src/thirdweb/thirdweb.module'
import { CashierController } from './cashier.controller'
import { CashierService } from './cashier.service'

@Module({
  imports: [ThirdWebModule],
  providers: [CashierService],
  controllers: [CashierController],
})
export class CashierModule {}
