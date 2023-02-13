import { Injectable } from '@nestjs/common'
import { TourneyPlacing, TourneyState } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class TourneyRepository {
  constructor(private prismaService: PrismaService) {}

  public async getWithTablesPlacingsEntries(tourneyId: number) {
    return this.prismaService.tourney.findUnique({
      where: {
        id: tourneyId
      },
      include: { entries: true, placings: true, tables: { include: { players: true } } }
    })
  }

  public async insertPlacings(
    tourneyId: number,
    placings: Omit<TourneyPlacing, 'tourneyId'>[],
    isFinished?: boolean
  ) {
    const state = isFinished ? { state: 'FINISHED' as TourneyState } : {}

    return this.prismaService.tourney.update({
      where: { id: tourneyId },
      data: {
        placings: {
          createMany: {
            data: placings
          }
        },
        ...state
      },
      include: { entries: true, placings: true }
    })
  }
}
