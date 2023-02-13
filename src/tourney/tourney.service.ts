import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma, Table, Tourney, TourneyEntry, TourneyType } from '@prisma/client'
import { BalanceService } from 'src/balance/balance.service'
import { BB_INCREASE_INTERVALS, TOURNEY_TURN_TIMEOUTS } from 'src/constants'
import { Emitter } from 'src/event/emitter'
import { PrismaService } from 'src/prisma/prisma.service'
import { Round } from 'src/round/round'
import { UserMessages } from 'src/socket/messages'
import { RoundGateway } from 'src/table/round.gateway'
import { TableService } from 'src/table/table.service'
import { TableWithPlayersUsersObservers } from 'src/table/table.types'
import { TimeoutService } from 'src/table/timeout.service'
import { getDistribution } from './distribution'

@Injectable()
export class TourneyService {
  constructor(
    private prismaService: PrismaService,
    private tableService: TableService,
    private balanceSerivce: BalanceService,
    private roundGateway: RoundGateway,
    private timeoutService: TimeoutService,
    private emitter: Emitter
  ) {}

  public getOne(tourneyId: number) {
    return this.prismaService.tourney.findUnique({
      where: { id: tourneyId },
      include: { entries: true, placings: true, tables: { include: { players: true } } }
    })
  }

  public async getAll(type: TourneyType) {
    return this.prismaService.tourney.findMany({
      where: { type },
      include: { entries: true, placings: true, tables: { include: { players: true } } }
    })
  }

  public async join(tourneyId: number, username: string) {
    const tourney = await this.prismaService.tourney.findUnique({
      where: { id: tourneyId },
      include: { entries: true }
    })

    this.validateJoining(tourney, username)

    const balance = await this.balanceSerivce.changeBalanceOne(username, tourney.buyin, 'TAKE OUT')

    this.emitter.some({
      message: UserMessages.BALANCE,
      username,
      payload: {
        usd: balance.usd
      }
    })

    const updated = await this.prismaService.tourney.update({
      where: { id: tourneyId },
      data: {
        entries: {
          create: {
            username
          }
        }
      },
      include: { entries: true, placings: true, tables: { include: { players: true } } }
    })

    switch (updated.type) {
      case 'SNG': {
        if (updated.entries.length === updated.tableSize)
          return {
            start: true,
            tourney: updated
          }
      }

      default: {
        return {
          start: false,
          tourney: updated
        }
      }
    }
  }

  public async unjoin(tourneyId: number, username: string) {
    const tourney = await this.prismaService.tourney.findUnique({
      where: { id: tourneyId },
      include: { entries: true }
    })

    this.validateUnjoining(tourney, username)

    const balance = await this.balanceSerivce.changeBalanceOne(username, tourney.buyin, 'PUT')

    this.emitter.some({
      message: UserMessages.BALANCE,
      username,
      payload: {
        usd: balance.usd
      }
    })

    return this.prismaService.tourney.update({
      where: { id: tourneyId },
      data: {
        entries: {
          delete: {
            username_tourneyId: {
              tourneyId,
              username
            }
          }
        }
      },
      include: { entries: true, placings: true, tables: { include: { players: true } } }
    })
  }

  private validateUnjoining(tourney: Tourney & { entries: TourneyEntry[] }, username: string) {
    if (tourney.state === 'IN_PROGRESS') {
      throw new BadRequestException('Tournament already started')
    }

    if (!tourney.entries.find((entry) => entry.username === username)) throw new BadRequestException('Not joined')
  }

  private validateJoining(tourney: Tourney & { entries: TourneyEntry[] }, username: string) {
    if (tourney.state === 'IN_PROGRESS') {
      throw new BadRequestException('Tournament already started')
    }

    if (tourney.entries.find((entry) => entry.username === username)) throw new BadRequestException('Already joined')
  }

  public async startSng(tourney: Tourney & { entries: TourneyEntry[] }) {
    const tablesCount = Math.ceil(tourney.entries.length / tourney.tableSize)

    const withTables = await this.prismaService.tourney.update({
      where: { id: tourney.id },
      data: {
        startedAt: new Date(),
        state: 'IN_PROGRESS',
        tables: {
          createMany: {
            data: this.generateTables(tourney, tablesCount)
          }
        }
      },
      include: { tables: true }
    })

    const distributed = getDistribution(tourney.tableSize, tourney.entries).map((table, i) =>
      table.map((player) => ({
        username: player.username,
        chips: tourney.chips,
        tableId: withTables.tables[i].id
      }))
    )

    const players = await this.prismaService.player.createMany({
      data: distributed.flat(2)
    })

    const resultTables: TableWithPlayersUsersObservers[] = []

    for await (const table of withTables.tables) {
      for await (const _players of distributed) {
        const round = new Round({
          bb: withTables.bb,
          tableId: table.id,
          type: 'TOURNEY',
          players: _players.map((_) => _.username),
          chips: tourney.chips,
          turnTimeout: TOURNEY_TURN_TIMEOUTS[withTables.speed]
        }).begin()

        const _table = await this.prismaService.table.update({
          where: { id: table.id },
          data: {
            current: round as unknown as Prisma.JsonObject
          },
          include: { players: { include: { user: true } }, observers: true }
        })

        resultTables.push(_table)
      }
    }

    return resultTables
  }

  private generateTables(tourney: Tourney, _count: number): Table[] {
    const { name, tableSize } = tourney
    return new Array(_count).fill({
      name,
      type: 'TOURNEY',
      state: 'ACTIVE',
      tableSize
    } as Table)
  }

  private async setBbIncrease(tourneyId: number) {
    const tables = await this.prismaService.table.findMany({
      where: { tourneyId }
    })
    for await (const table of tables) {
      const round = Round.from(table.current)
      round.setIncreaseNextTurn()
      await this.roundGateway.insertRound(table.id, round)
    }
  }

  public async setTourneyBbIncrease(tourney: Tourney) {
    const sec = BB_INCREASE_INTERVALS[tourney.speed]
    const interval = setInterval(async () => {
      await this.setBbIncrease(tourney.id)
    }, sec * 1000)
    this.timeoutService.setBbIncreaseInterval(tourney.id, interval)
  }

  public async stopTourneyBbIncrease(tourneyId: number) {
    this.timeoutService.clearBbIncreaseInterval(tourneyId)
  }

  public async createCopy(tourney: Tourney) {
    const { bb, buyin, chips, name, prizes, speed, tableSize, type } = tourney
    await this.prismaService.tourney.create({
      data: {
        buyin,
        chips,
        name,
        speed,
        tableSize,
        type,
        bb,
        prizes
      }
    })
  }

  public async getTourneyBySample(tourneyId: number) {
    const { buyin, tableSize, speed } = await this.prismaService.tourney.findUnique({ where: { id: tourneyId } })
    return this.prismaService.tourney.findFirst({ where: { buyin, tableSize, speed, state: 'REGISTERING' } })
  }
}
