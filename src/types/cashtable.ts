import {
  CashTable,
  Speed,
  Table,
  TableState,
  TableType,
  Player,
  Tourney,
  TourneyEntry,
  TourneyPlacing,
  TourneyState,
  TourneyType
} from '@prisma/client'

export type DetailedCashTable = CashTable & {
  table: Table & {
    players: Player[]
  }
}


export type DetailedTourney = Tourney & {
  tables: (Table & {
    players: Player[]
  })[]
  entries: TourneyEntry[]
  placings: TourneyPlacing[]
}

export type FlatCashTable = {
  id: number
  state: TableState
  name: string
  stack: number
  bb: number
  tableSize: number
  playersCount: number
}

export type FlatTourney = {
  id: number
  type: TourneyType
  state: TourneyState
  name: string
  buyin: number
  chips: number
  tableSize: number
  speed: Speed
  entries: string[]
  placings: {
    username: string
    place: number
    amount: number
  }[]
  prizes: number[]
  startedAt?: number
  tables: {
    id: number
    players: {
      username: string
      chips: number
    }[]
  }[]
}
