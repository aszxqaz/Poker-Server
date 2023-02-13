import { Logger } from '@nestjs/common'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Namespace } from 'socket.io'
import { TOURNEY_TURN_TIMEOUTS } from 'src/constants'
import { Emitter } from 'src/event/emitter'
import { Round } from 'src/round/round'
import { SngMessages } from 'src/socket/messages'
import { RoundGateway } from 'src/table/round.gateway'
import { SubscriberService } from 'src/table/subscriber.service'
import { TableGateway } from 'src/table/table.gateway'
import { TableService } from 'src/table/table.service'
import { TransformService } from 'src/transform/transform.service'
import { SocketWithUser } from 'src/types'
import { TourneyService } from './tourney.service'

@WebSocketGateway()
export class TourneyGateway {
  @WebSocketServer() io!: Namespace
  private logger = new Logger(TourneyGateway.name)
  private bbIntervals = new Map<number, number>()

  constructor(
    private tourneyService: TourneyService,
    private transformService: TransformService,
    private tableGateway: TableGateway,
    private subscriberService: SubscriberService,
    private tableService: TableService,
    private roundGateway: RoundGateway,
    private emitter: Emitter
  ) {}

  @SubscribeMessage(SngMessages.ONE)
  async getTourney(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody()
    { method, tourneyId }: { method: 'SUBSCRIBE' | 'UNSUBSCRIBE'; tourneyId: number }
  ) {
    if (method === 'UNSUBSCRIBE') {
      this.subscriberService.remove(tourneyId, socket.request.user.username)
      return
    }

    const tourney = await this.tourneyService.getOne(tourneyId)
    const transformed = this.transformService.toFlatTourney(tourney)

    this.logger.debug(`Message <${SngMessages.ONE}> received`)

    socket.emit(SngMessages.ONE, transformed)

    this.subscriberService.add(tourneyId, socket.request.user.username)
  }

  @SubscribeMessage(SngMessages.ALL)
  async getAllSngTourneys(@ConnectedSocket() socket: SocketWithUser) {
    const tables = await this.tourneyService.getAll('SNG')
    const transformed = this.transformService.toFlatTourney(...tables)

    socket.emit(SngMessages.ALL, transformed)
  }

  @SubscribeMessage(SngMessages.JOIN)
  async join(@ConnectedSocket() socket: SocketWithUser, @MessageBody() { tourneyId }: { tourneyId: number }) {
    const { username } = socket.request.user
    this.logger.debug(`Message <${SngMessages.JOIN}> received from ${username}`)

    const { tourney, start } = await this.tourneyService.join(tourneyId, username)

    // this.io.to(getSocketId(username)).emit(UserMessages.BALANCE)

    if (start) {
      const tables = await this.tourneyService.startSng(tourney)
      for (const table of tables) {
        this.roundGateway.setSkipTimeout(table, TOURNEY_TURN_TIMEOUTS[tourney.speed])
        this.roundGateway.sendRoundToTableParticipants(table, table.current as unknown as Round)
      }
      await this.tourneyService.setTourneyBbIncrease(tourney)
      await this.tourneyService.createCopy(tourney)
    }

    const transformed = this.transformService.toFlatTourney(tourney)

    this.emitter.some({
      message: SngMessages.ONE,
      username: this.subscriberService.get(tourneyId),
      payload: transformed
    })

    this.emitter.all({
      message: SngMessages.ONE,
      payload: transformed
    })
  }

  @SubscribeMessage(SngMessages.UNJOIN)
  async unjoin(@ConnectedSocket() socket: SocketWithUser, @MessageBody() { tourneyId }: { tourneyId: number }) {
    const { username } = socket.request.user
    this.logger.debug(`Message <${SngMessages.UNJOIN}> received from ${username}`)

    const tourney = await this.tourneyService.unjoin(tourneyId, username)

    const transformed = this.transformService.toFlatTourney(tourney)

    this.emitter.some({
      message: SngMessages.ONE,
      username: this.subscriberService.get(tourneyId),
      payload: transformed
    })

    this.emitter.all({
      message: SngMessages.ONE,
      payload: transformed
    })
  }

  @SubscribeMessage(SngMessages.PLAY_AGAIN)
  async again(@ConnectedSocket() socket: SocketWithUser, @MessageBody() { tourneyId }: { tourneyId: number }) {
    const { username } = socket.request.user
    this.logger.debug(`Message <${SngMessages.PLAY_AGAIN}> received from ${username}`)

    const sample = await this.tourneyService.getTourneyBySample(tourneyId)
    this.join(socket, { tourneyId: sample.id })
  }
}
