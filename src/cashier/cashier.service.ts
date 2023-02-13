import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ethers, providers } from 'ethers'
import { PrismaService } from 'src/prisma/prisma.service'
import { ThirdwebService } from 'src/thirdweb/thirdweb.service'

@Injectable()
export class CashierService {
  constructor(
    private readonly thirdweb: ThirdwebService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async generateWallet(username: string) {
    const _wallet = await this.thirdweb.generateWallet()

    const wallet = await this.prisma.wallet.create({ data: { username, ..._wallet } })

    return { wallet }
  }

  async getWallet(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: { wallet: true }
    })

    if (!user) throw new UnauthorizedException('Not authorized')
    if (!user.wallet) return null

    return {
      wallet: user.wallet
    }
  }

  async checkPayment(username: string) {
    const { wallet } = await this.getWallet(username)

    const payments = await this.thirdweb.getPaymentsToWallet(wallet.address)

    if (!payments)
      return {
        message: 'No transactions found'
      }

    const etherPrice = await this.thirdweb.getEtherPrice()

    console.log(etherPrice)

    let amount = payments.reduce(
      (prev, cur) => prev + Math.floor(cur.valueInEther * etherPrice.ethUsd * 100), // in cents
      0
    )

    await this.sendToBalance(username, amount)

    // await this.thirdweb.transferToRoomWallet(wallet.encJson, '0.0005')
  }

  public sendToBalance(username: string, amount: number) {
    return this.prisma.balance.update({
      where: {
        username
      },
      data: {
        usd: {
          increment: amount
        }
      }
    })
  }

  public getBalance(userId: string) {}
}
