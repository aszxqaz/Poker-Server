import { RoundPlayer } from '../round.types'
import { BbLevelRound } from './bbLevel'
import { DeckRound } from './deck'
import { BoolFieldArr, getIndexWithExclude } from './helpers'

export class PlayerRound extends BbLevelRound {
  players: RoundPlayer[] = []
  hero: RoundPlayer
  pot: number

  constructor() {
    super()
  }

  protected getAllBets() {
    return this.players
      .map((_) => _.bet)
      .filter((a) => a > 0)
      .sort((a, b) => b - a)
  }

  protected setPot() {
    this.pot = this.getAllBets().reduce((a, b) => a + b)
  }

  protected getMaxBet() {
    return this.getAllBets().length ? Math.max(...this.getAllBets()) : 0
  }

  protected clearBets() {
    this.players.forEach((player) => {
      player.bet = 0
    })
  }

  protected resetIsDoneAfterBet() {
    this.players.forEach((player) => {
      if (player.username !== this.hero.username && !player.isOut && player.chips) {
        player.isDone = false
      }
    })
  }

  protected resetIsDone() {
    this.players.forEach((player) => {
      if (!player.isOut && player.chips) player.isDone = false
    })
  }

  protected getPlayersNotOut() {
    return this.players.filter((player) => !player.isOut && !player.isWaitingForBB)
  }

  protected getPlayerWithChips() {
    return this.players.filter((player) => player.chips)
  }

  protected getPlayerNotDone() {
    return this.players.filter((player) => !player.isDone)
  }

  protected getIndex(startIndex: number, exclude: BoolFieldArr<typeof this.players[number]>) {
    return getIndexWithExclude(startIndex, exclude, this.players)
  }

  public shouldUpdatePlayersInfo() {
    return !this.board.length && this.getAllBets().length === 2
  }

  public getLeftPlayers() {
    return this.players.filter(player => player.isLeft).map(player => ({
      username: player.username,
      limit: player.limit
    }))
  }
}
