import { Tourney, User } from '@prisma/client'

export type TourneyWithPlayers = Tourney & {
  players: User[]
}
