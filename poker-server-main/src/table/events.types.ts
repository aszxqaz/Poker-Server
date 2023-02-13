import { Round } from 'src/round/round'
import { TableWithPlayersUsersObservers } from './table.types'

export const Events = {
  EMIT_TABLE_TO_SOCKET: 'EMIT_TABLE_TO_SOCKET',
  SEND_ROUND_TO_PLAYERS: 'SEND_ROUND_TO_PLAYERS'
}

export class EmitTableToSocketEvent {
  constructor(
    public message: string,
    public username: string,
    public table: TableWithPlayersUsersObservers,
    public round: Round
  ) {}
}

export class SendRoundToPlayersEvent {
  constructor(public table: TableWithPlayersUsersObservers, public round: Round) {}
}
