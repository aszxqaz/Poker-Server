// import { Logger } from '@nestjs/common'
// import {
//   ConnectedSocket,
//   MessageBody,
//   OnGatewayConnection,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer
// } from '@nestjs/websockets'
// import { Namespace } from 'socket.io'
// import { getSocketId, setSocketId } from 'src/socketIds'
// import { SocketWithUser } from 'src/types'
// import { setTimeout } from 'timers/promises'
// import { InsertRoundReturn, TableService } from './table.service'
// import { TableUtilsService } from './table.utils'
// import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
// import { Round } from 'src/round/round'
// import { TableWithPlayersAndUsers } from './table.types'
// import { EmitTableToSocketEvent, Events } from './events.types'
// import { ActiveMessages, TableMessages } from 'src/socket/messages'

// @WebSocketGateway()
// export class RoundGateway {
//   @WebSocketServer() io!: Namespace
//   private logger = new Logger(TableGateway.name)

//   constructor(
//     private tableService: TableService,
//     private utilsService: TableUtilsService,
//     private eventEmitter: EventEmitter2
//   ) {}

//   // @UseGuards(CustomSocketGuard)
//   @SubscribeMessage(TableMessages.ACTION)
//   async receiveAction(
//     @ConnectedSocket() socket: SocketWithUser,
//     @MessageBody() body: { tableId: number; val: number }
//   ) {
//     let table = await this.tableService.takeAction(
//       body.tableId,
//       socket.request.user.username,
//       body.val
//     )
//     let round = Round.from(table)

//     this.eventEmitter.emit(Events.SEND_ROUND_TO_PLAYERS, table)

//     while (round.allinShowdown && !round.done) {
//       round.checkAllin()
//       await setTimeout(1000)
//       const table = await this.tableService.insertRound(body.tableId, round)
//       this.eventEmitter.emit(Events.SEND_ROUND_TO_PLAYERS, table)
//     }

//     if (round.done) {
//       round.nextHand()
//       const updated = await this.tableService.insertRound(table.id, round)
//       await setTimeout(1000)
//       this.eventEmitter.emit(Events.SEND_ROUND_TO_PLAYERS, table)
//     }
//   }

//   @OnEvent(Events.SEND_ROUND_TO_PLAYERS)
//   private handleSendRoundToPlayers(table: TableWithPlayersAndUsers) {
//     table.players.forEach((player, i) => {
//       this.io
//         .to(getSocketId(player.username))
//         .emit(
//           'round.started',
//           this.utilsService.formatTableAndRound(table, player.username)
//         )
//     })
//   }

//   @OnEvent(Events.EMIT_TABLE_TO_SOCKET)
//   private handleEmitTableToSocket(payload: EmitTableToSocketEvent) {
//     const { username, table, message } = payload
//     this.io
//       .to(getSocketId(username))
//       .emit(message, this.utilsService.formatTableAndRound(table, username))
//   }
// }

export const a = 0