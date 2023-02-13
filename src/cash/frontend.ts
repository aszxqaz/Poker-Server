export interface FrontendCashTable {
  id: number
  name: string
  stack: number
  bb: number
  count: number

  players: {
    username: string
    chips: number
  }[]
}

export type FrontendRound = {
  bb: number
  pot: number
  players: FrontendRoundPlayer[]
  board: number[][]
  sbIndex: number
  bbIndex: number
  toCall: number
  buttonIndex: number
  turnIndex: number
  winners: unknown[]
  minbet: number
  cards: number[][]
}

export type FrontendRoundPlayer = {
  username: string
  chips: number
  bets: number[]
  isDone: boolean
  isOut: boolean
}

