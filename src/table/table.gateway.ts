import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Namespace } from 'socket.io'
import { BalanceService } from 'src/balance/balance.service'
import { ALLIN_SHOWDOWN_DELAY, RIVER_SHOWDOWN_DELAY } from 'src/constants'
import { Emitter } from 'src/event/emitter'
import { TourneyRepository } from 'src/repository/tourney.repository'
import { Round } from 'src/round/round'
import { ActiveMessages, SngMessages, TableMessages, TourneyMessages } from 'src/socket/messages'
import { TransformService } from 'src/transform/transform.service'
import { SocketWithUser } from 'src/types'
import { setTimeout } from 'timers/promises'
import { PlayerService } from './player.service'
import { RoundGateway } from './round.gateway'
import { SubscriberService } from './subscriber.service'
import { TableService } from './table.service'
import { TableWithPlayersUsersObservers } from './table.types'
import { TimeoutService } from './timeout.service'

@WebSocketGateway()
export class TableGateway implements OnGatewayConnection {
  @WebSocketServer() io!: Namespace
  private logger = new Logger(TableGateway.name)

  constructor(
    private tableService: TableService,
    private transformService: TransformService,
    private subscriberService: SubscriberService,
    private balanceService: BalanceService,
    private playerService: PlayerService,
    private timeoutService: TimeoutService,
    private tourneyRepository: TourneyRepository,
    private roundGateway: RoundGateway,
    private emitter: Emitter
  ) {}

  async handleConnection(socket: SocketWithUser) {
    if (!socket.request.user) {
      this.logger.debug(`Socket ${socket.id} not authorized`)
      socket.disconnect()
      return
    }
    const { username } = socket.request.user
    this.logger.debug(`Socket ${username} connected`)

    const active = await this.tableService.findTablesByUsername(username)

    if (active.length) {
      const payload = active.map((table) =>
        this.transformService.formatTableAndRound(table, table.current as unknown as Round, username)
      )
      this.emitter.some({
        message: ActiveMessages.ALL,
        username,
        payload
      })
    }
  }

  // @UseGuards(CustomSocketGuard)

  @SubscribeMessage(TableMessages.ACTION)
  async receiveAction(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() { tableId, value }: { tableId: number; value: number }
  ) {
    const username = socket.request.user.username
    let result = await this.tableService.takeAction(tableId, username, value)

    if (!result) return null
    const { table, round } = result

    this.roundGateway.clearSkipTimeout(table.id)
    await this.roundGateway.insertRoundAndNotify(table, round)

    if (round.allinShowdown) {
      await this.allinShowdownLoop(round, table)
    } else {
      if (round.done) {
        await setTimeout(RIVER_SHOWDOWN_DELAY * 1000)
        round.nextHand()
        await this.roundGateway.insertRoundAndNotify(table, round)
        // if (round.shouldTimeoutBeSet()) this.tableService.setSkipTimeouts([_table], round.TURN_TIMEOUT)
      } else {
        // if (round.shouldTimeoutBeSet()) this.tableService.setSkipTimeouts([updatedTable], round.TURN_TIMEOUT)
      }
    }
  }

  private async allinShowdownLoop(round: Round, table: TableWithPlayersUsersObservers) {
    const { id: tableId, tourneyId, type } = table

    while (round.allinShowdown) {
      this.roundGateway.clearSkipTimeout(table.id)

      while (!round.done) {
        await setTimeout(ALLIN_SHOWDOWN_DELAY * 1000)
        round.nextStreet()
        await this.roundGateway.insertRoundAndNotify(table, round)
      }
      if (type === 'TOURNEY' && round.getLeftPlayers().length) {
        const detailed = await this.tableService.resolvePlacings(tourneyId, round)
        const { entries, placings, ...tourney } = detailed

        const winner = placings.find((placing) => placing.place === 1)
        const leftPlayers = round.getLeftPlayers().map((player) => player.username)

        if (winner) {
          leftPlayers.push(winner.username)
          this.timeoutService.clearBbIncreaseInterval(tourneyId)
        }

        for (const placing of placings) {
          const { amount, place, username } = placing
          this.emitter.some({
            username,
            message: TourneyMessages.FINISH,
            payload: {
              tourney,
              place,
              amount,
              entries: entries.length
            }
          })
        }

        await this.playerService.deletePlayers(tableId, leftPlayers)
        await this.playerService.createObservers(tableId, leftPlayers)
        await this.balanceService.putToBalanceMany(placings)

        const tourney2 = await this.tourneyRepository.getWithTablesPlacingsEntries(table.tourneyId)

        this.emitter.some({
          message: SngMessages.ONE,
          username: this.subscriberService.get(tourneyId),
          payload: this.transformService.toFlatTourney(tourney2)
        })

        if (winner) break
      }

      await setTimeout(RIVER_SHOWDOWN_DELAY * 1000)
      round.nextHand()
      const updatedTable = await this.roundGateway.insertRoundAndNotify(table, round)
      // if (round.shouldTimeoutBeSet()) this.tableService.setSkipTimeouts([updatedTable], round.TURN_TIMEOUT)
    }
  }
}
