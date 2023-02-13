import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { Round } from './round'

@Injectable()
export class RoundService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getLast(tableId: number) {}


  // public async takeAction(tableId: number, username: string, value: number) {
  //   // Finding CashTable with Players and User
  //   const table = await this.prismaService.table.findUnique({
  //     where: { id: tableId },
  //   })

  //   // Getting new state of the round
  //   let round = Round.from(table.gameplay.current).takeAction(username, value)

  //   // Inserting round into CashTable
  //   await this.insertRound(tableId, round)

  //   return {
  //     ...table,
  //     round
  //   }
  // }

  public parseJson(json: Prisma.JsonValue) {
    return JSON.parse(json as string)
  }
}
