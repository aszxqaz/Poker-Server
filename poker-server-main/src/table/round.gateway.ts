import { Logger } from '@nestjs/common'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Prisma } from '@prisma/client'
import { Namespace } from 'socket.io'
import { NEXT_HAND_DELAY } from 'src/constants'
import { Emitter } from 'src/event/emitter'
import { PrismaService } from 'src/prisma/prisma.service'
import { Round } from 'src/round/round'
import { ActiveMessages } from 'src/socket/messages'
import { TransformService } from 'src/transform/transform.service'
import { setTimeout as setTimeoutAsync } from 'timers/promises'
import { PlayerService } from './player.service'
import { TableService } from './table.service'
import { TableWithPlayersUsersObservers } from './table.types'
import { TimeoutService } from './timeout.service'

@WebSocketGateway()
export class RoundGateway {
  @WebSocketServer() private io!: Namespace
  private logger = new Logger(RoundGateway.name)

  constructor(
    private transformService: TransformService,
    private prismaService: PrismaService,
    private playerService: PlayerService,
    private emitter: Emitter,
    private tableService: TableService,
    private timeoutService: TimeoutService
  ) {}

  public async insertRoundAndNotify(table: TableWithPlayersUsersObservers, round: Round) {
    if (round.shouldTimeoutBeSet()) {
      this.setSkipTimeouts([table], round.TURN_TIMEOUT)
      round.setTimeStamp()
    }
    const updated = await this.insertRound(table.id, round)
    this.sendRoundToTableParticipants(table, round)
    if (round.shouldUpdatePlayersInfo()) {
      await this.playerService.updatePlayersStacks(table.id, round.players)
    }
    return updated
  }

  public async insertRound(tableId: number, round: Round) {
    return this.prismaService.table.update({
      where: { id: tableId },
      data: {
        rounds: {
          push: round as unknown as Prisma.InputJsonObject
        },
        current: round as unknown as Prisma.InputJsonObject
      },
      include: {
        observers: true,
        players: {
          include: {
            user: true
          }
        }
      }
    })
  }

  public sendRoundToTableParticipants(table: TableWithPlayersUsersObservers, round: Round) {
    const participants = [...table.players, ...table.observers]
    for (const participant of participants) {
      this.emitter.some({
        message: ActiveMessages.ONE,
        username: participant.username,
        payload: this.transformService.formatTableAndRound(table, round, participant.username)
      })
    }
  }

  public setSkipTimeout(__table: TableWithPlayersUsersObservers, sec: number) {
    this.timeoutService.clearSkipTimeout(__table.id)
    const timeout = setTimeout(async () => {
      const table = await this.prismaService.table.findUnique({
        where: { id: __table.id },
        include: { players: { include: { user: true } }, observers: true }
      })
      const round = Round.from(table.current).skipAction()
      if (!round) return
      await this.insertRoundAndNotify(table, round)
      if (round.done) {
        await setTimeoutAsync(NEXT_HAND_DELAY * 1000)
        round.nextHand()
        const updated = await this.insertRoundAndNotify(__table, round)
        this.setSkipTimeout({ ...__table, ...updated }, sec)
      }
    }, 1000 * sec)
    this.timeoutService.setSkipTimeout(__table.id, timeout)
  }

  public setSkipTimeouts(tables: TableWithPlayersUsersObservers[], sec: number) {
    for (const table of tables) {
      this.setSkipTimeout(table, sec)
    }
  }

  public clearSkipTimeout(tableId: number) {
    this.timeoutService.clearSkipTimeout(tableId)
  }
}
