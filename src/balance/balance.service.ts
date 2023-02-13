import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class BalanceService {
  constructor(private readonly prismaService: PrismaService) {}

  public async changeBalanceOne(
    username: string,
    amount: number,
    method: 'PUT' | 'TAKE OUT'
  ) {
    let type = 'increment' as 'increment' | 'decrement'
    if (method === 'TAKE OUT') {
      const balance = await this.prismaService.balance.findUnique({ where: { username } })
      if (balance.usd < amount) {
        throw new BadRequestException('Not enough funds')
      }
      type = 'decrement'
    }

    return await this.prismaService.balance.update({
      where: { username },
      data: {
        usd: {
          [type]: amount
        }
      }
    })
  }

  public async putToBalanceMany(prizes: { username: string; amount: number }[]) {
    for (const prize of prizes) {
      if (prize.amount <= 0) continue
      await this.changeBalanceOne(prize.username, prize.amount, 'PUT')
    }
  }
}
