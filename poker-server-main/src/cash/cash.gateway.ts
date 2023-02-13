import { Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets'
import { Namespace } from 'socket.io'
import { ActiveMessages, CashMessages } from 'src/socket/messages'
import { Events, SendRoundToPlayersEvent } from 'src/table/events.types'
import { RoundGateway } from 'src/table/round.gateway'
import { TableGateway } from 'src/table/table.gateway'
import { TableService } from 'src/table/table.service'
import { TransformService } from 'src/transform/transform.service'
import { SocketWithUser } from 'src/types'
import { CashService } from './cash.service'

@WebSocketGateway()
export class CashGateway implements OnGatewayConnection {
  @WebSocketServer() io!: Namespace
  private logger = new Logger(CashGateway.name)

  constructor(
    private readonly cashService: CashService,
    private readonly transformService: TransformService,
    private readonly tableGateway: TableGateway,
    private readonly roundGateway: RoundGateway
  ) {}

  async handleConnection(socket: SocketWithUser, ...args: any[]) {}

  /* Lobby */
  @SubscribeMessage(CashMessages.ALL)
  async getAllCashTables(@ConnectedSocket() socket: SocketWithUser) {
    const { username } = socket.request.user

    this.logger.debug(`Message <${CashMessages.ALL}> received from ${username}`)

    const tables = await this.cashService.getAll()
    const transformed = this.transformService.toFlatCashTable(...tables)

    this.logger.debug(`Emitting ${transformed.length} cash tables`)

    socket.emit(CashMessages.ALL, transformed)
  }

  // @UseGuards(CustomSocketGuard)
  @SubscribeMessage(CashMessages.JOIN)
  async joinTable(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() { tableId, buyin }: { tableId: number; buyin: number }
  ) {
    const { username } = socket.request.user
    this.logger.debug(`Message <${CashMessages.JOIN}> received from ${username}`)

    // Validating and adding player to CashTable
    // Should return table and round
    const { cashTable, round } = await this.cashService.joinTable(
      username,
      tableId,
      buyin
    )

    const [transformed] = this.transformService.toFlatCashTable(cashTable)

    this.io.emit(CashMessages.ONE, transformed)
    this.roundGateway.sendRoundToTableParticipants(cashTable.table, round)
  }

  @SubscribeMessage(CashMessages.LEAVE)
  async leaveTable(
    @ConnectedSocket() socket: SocketWithUser,
    @MessageBody() tableId: number
  ) {
    const { username } = socket.request.user

    const { cashTable, round } = await this.cashService.removePlayer(tableId, username)
    const [transformed] = this.transformService.toFlatCashTable(cashTable)

    this.io.emit(CashMessages.ONE, transformed)
    socket.emit(CashMessages.LEAVE, tableId)

    this.roundGateway.sendRoundToTableParticipants(cashTable.table, round)
  }
}
