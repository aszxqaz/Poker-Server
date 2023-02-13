import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { TableType } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { TourneyRepository } from 'src/repository/tourney.repository'
import { Round } from 'src/round/round'

@Injectable()
export class TableService {
  logger = new Logger(TableService.name)

  constructor(private readonly prismaService: PrismaService, private tourneyRepo: TourneyRepository) {}

  async getAll(type?: TableType) {
    const found = await this.prismaService.table.findMany({
      where: { type },
      include: {
        players: {
          select: {
            chips: true,
            username: true
          }
        }
      }
    })

    return found
  }

  public async removePlayerFromTable(username: string, tableId: number) {
    const updated = await this.prismaService.table.update({
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
      },
      include: {
        players: {
          select: {
            username: true,
            chips: true
          }
        }
      }
    })

    return updated
  }

  public async findTablesByUsername(username: string) {
    const found = await this.prismaService.table.findMany({
      include: {
        players: {
          include: {
            user: true
          }
        }
      },
      where: {
        players: {
          some: {
            username
          }
        }
      }
    })

    return found
  }

  public findUniqueWithPlayers(tableId: number) {
    return this.prismaService.table.findUnique({
      where: { id: tableId },
      include: {
        players: {
          include: {
            user: true
          }
        }
      }
    })
  }

  public async resolvePlacings(tourneyId: number, round: Round) {
    this.logger.debug(`resolvePlacings()`)
    const tourney = await this.tourneyRepo.getWithTablesPlacingsEntries(tourneyId)
    const total = tourney.entries.length

    let tourneyPlayersCount = 0
    // calculating total count of players
    for (const table of tourney.tables) {
      tourneyPlayersCount += (table.current as unknown as Round).players.length
    }
    this.logger.debug(`Total players calculated: ${tourneyPlayersCount}`)

    // left = 2, total = 3

    const placings = round
      .getLeftPlayers()
      .sort((a, b) => a.limit - b.limit)
      .map((player, i) => ({
        username: player.username,
        // tourneyId,
        place: tourneyPlayersCount - i,
        amount: tourney.prizes[tourneyPlayersCount - i] || 0
      }))

    let isFinished = false

    if (placings.find((player) => player.place === 2)) {
      isFinished = true
      placings.push({
        username: round.getWinner().username,
        // tourneyId,
        place: 1,
        amount: tourney.prizes[0]
      })
    }

    return this.tourneyRepo.insertPlacings(tourneyId, placings, isFinished)

    // await this.prismaService.tourneyPlacing.createMany({
    //   data: sorted
    // })

    // return this.prismaService.tourney.findUnique({
    //   where: { id: tourneyId },
    //   include: { entries: true, placings: true }
    // })
  }

  public async takeAction(tableId: number, username: string, value: number) {
    const table = await this.prismaService.table.findUnique({
      where: { id: tableId },
      include: { players: { include: { user: true } }, observers: true }
    })

    let round = Round.from(table.current).takeAction(username, value)
    if (!round) throw new BadRequestException('No round returned')

    this.logger.log(round)

    return {
      table,
      round
    }
  }
}
