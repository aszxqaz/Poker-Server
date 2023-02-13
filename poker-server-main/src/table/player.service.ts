import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class PlayerService {
  private logger = new Logger(PlayerService.name)
  constructor(private prismaService: PrismaService) {}

  public async addPlayer(tableId: number, username: string, chips: number) {
    return this.prismaService.player.create({
      data: {
        chips,
        tableId,
        username
      }
    })
  }

  public async deletePlayers(tableId: number, usernames: string[]) {
    await this.prismaService.player.deleteMany({
      where: {
        OR: usernames.map((username) => ({ tableId, username }))
      }
    })
  }

  public async createObservers(tableId: number, usernames: string[]) {
    await this.prismaService.observer.createMany({
      data: usernames.map((username) => ({ tableId, username }))
    })
  }

  public async updatePlayersStacks(
    tableId: number,
    players: { username: string; chips: number }[]
  ) {
    this.logger.debug(`updatePlayersStacks invocation with arguments: (tableId: ${tableId}; players: ${players.toString()})`)
    for (const player of players) {
      await this.prismaService.player.update({
        where: {
          username_tableId: {
            tableId,
            username: player.username
          }
        },
        data: {
          chips: player.chips
        }
      })
    }

  }
}
