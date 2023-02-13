import { Table, Player, User, TableType, Observer } from '@prisma/client'

export type TableWithPlayers = Table & {
  players: Player[]
}

export type TableWithPlayersUsers = Table & {
  players: (Player & {
    user: User
  })[]
}

export type TableWithPlayersUsersObservers = Table & {
  players: (Player & {
    user: User
  })[]
  observers: Observer[]
}

export type TableWithPlayersAndRound = TableWithPlayers & {}

export type EmittableTable = {
  id: number
  name: string
  type: TableType
  players: {
    username: string
    avatar: string
  }[]
}
