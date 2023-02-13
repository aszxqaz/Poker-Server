import { Speed } from '@prisma/client'

export const CASH_TURN_TIMEOUT = 20
export const NEXT_HAND_DELAY = 0.2
export const ALLIN_SHOWDOWN_DELAY = 1
export const RIVER_SHOWDOWN_DELAY = 1

export const BB_SIZES = [20, 30, 40, 50, 60, 80, 100, 120, 140, 170, 200, 250, 300, 350, 400, 450, 500, 800, 1000, 1600, 2000, 2500, 3000]

export const BB_INCREASE_INTERVALS: Record<Speed, number> = {
  ULTRA: 10,
  HYPER: 60 * 3,
  TURBO: 60 * 7,
  REGULAR: 60 * 10
}

export const TOURNEY_TURN_TIMEOUTS: Record<Speed, number> = {
  ULTRA: 5 * 1000000,
  HYPER: 10 * 1000000,
  TURBO: 10 * 1000000,
  REGULAR: 10
}