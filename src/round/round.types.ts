import { TableType } from '@prisma/client'
import { Round } from './round'

export interface RoundPlayer {
  username: string
  chips: number
  bet: number
  isDone?: boolean | undefined
  isActive?: boolean | undefined
  isOut?: boolean | undefined
  isWaitingForBB?: boolean | undefined
  isSitOut?: boolean | undefined
  isLeaving?: boolean | undefined
  isLeft?: boolean | undefined
  cards: number[]
  limit: number
}

export interface LeftPlayer {
  username: string
  limit: number
}

export interface Showdown {
  username: string
  cards: number[]
}

export interface Winner {
  hand?: number[]
  username: string
  amount: number
  strength?: {
    relative: number,
    absolute: number
  }
  isHighlighted: boolean
}

export interface PrevAction {
  username: string
  type: 'CHECK' | 'CALL' | 'BET' | 'RAISE' | 'FOLD' | 'ALL IN'
}

export type RoundOptions = {
  bb: number
  tableId: number
  turnTimeout: number
  type?: TableType
  players?: string[]
  chips?: number
}


// export type FrontendRoundPlayer = Pick<
//   InternalRoundPlayer,
//   'bet' | 'chips' | 'username'
// > & {
//   isSB: boolean
//   isBB: boolean
// }

// export type Hero = {
//   isYourTurn: boolean
//   cards: FrontendCard[]
// }

// export type FrontendRound = Pick<Round, 'board' | 'pot'> & {
//   players: FrontendRoundPlayer[]
//   hero: Hero
// }
