import { Controller, Get, Post, Req } from '@nestjs/common'
import { Username } from 'src/common/decorators'
import { RequestWithUser } from 'src/types'
import { CashierService } from './cashier.service'

@Controller('cashier')
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Get('wallet')
  async getWallet(@Username() username: string) {
    let wallet = await this.cashierService.getWallet(username)

    if (!wallet) {
      wallet = await this.cashierService.generateWallet(username)
    }

    return wallet
  }

  @Get('check')
  async checkPayment(@Username() username: string) {
    await this.cashierService.checkPayment(username)
  }
}
