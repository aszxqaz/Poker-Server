import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { Round } from '../round/round'
import { Prisma } from '@prisma/client'
import { TableService } from 'src/table/table.service'
import { RoundService } from 'src/round/round.service'
import { DetailedCashTable } from 'src/types/cashtable'
import { PlayerService } from 'src/table/player.service'
import { RoundGateway } from 'src/table/round.gateway'

@Injectable()
export class CashService {
  logger = new Logger(CashService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tableService: TableService,
    private readonly playerService: PlayerService,
    private readonly roundGateway: RoundGateway
  ) {}

  public async joinTable(username: string, tableId: number, buyin: number) {
    const cashTable = await this.findById(tableId)
    this.validateJoining(cashTable, username, buyin)
    await this.playerService.addPlayer(tableId, username, buyin)

    const round = Round.from(cashTable.table.current).addPlayer(username, buyin)

    // Updating CashTable
    await this.roundGateway.insertRound(tableId, round)

    const updated = await this.findById(tableId)

    return {
      cashTable: updated,
      round
    }
  }

  public async removePlayer(tableId: number, username: string) {
    const table = await this.prismaService.table.update({
      where: { id: tableId },
      data: {
        players: {
          delete: {
            username_tableId: {
              tableId,
              username
            }
          }
        }
      }
    })

    const round = Round.from(table.current).removePlayer(username)
    await this.roundGateway.insertRound(tableId, round)

    const cashTable = await this.prismaService.cashTable.findUnique({
      where: { tableId },
      include: {
        table: { include: { players: { include: { user: true } }, observers: true } }
      }
    })

    return {
      cashTable,
      round
    }
  }

  private validateJoining(cashTable: DetailedCashTable, username: string, buyin: number) {
    if (cashTable.table.players.length === cashTable.tableSize) {
      throw new BadRequestException('Table is full')
    }

    if (cashTable.table.players.find((player) => player.username === username)) {
      throw new BadRequestException('Already joined')
    }

    if (buyin > cashTable.bb * cashTable.stack) {
      throw new BadRequestException('Not enough funds')
    }
  }

  public async getAll() {
    return this.prismaService.cashTable.findMany({
      include: {
        table: {
          include: { players: true }
        }
      }
    })
  }

  public async findById(tableId: number) {
    return this.prismaService.cashTable.findUnique({
      where: { tableId },
      include: {
        table: {
          include: { players: { include: { user: true } }, observers: true }
        }
      }
    })
  }
}
