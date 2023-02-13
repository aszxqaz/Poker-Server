import { Prisma, TableType } from '@prisma/client'
import { appendFileSync } from 'fs'
import { BB_SIZES } from 'src/constants'
import { convertCard, getCombination } from './calculation'
import { SORTED_CARDS_PACK } from './constants'
import { LeftPlayer, PrevAction, RoundOptions, RoundPlayer, Showdown, Winner } from './round.types'
import { DeckRound } from './round/deck'
import { BoolFieldArr, getIndexWithExclude } from './round/helpers'
import { PlayerRound } from './round/player'
import { fromNumToScreen } from './screenCard'
import { getPotSplit } from './getPotSplit'

export class Round extends PlayerRound {
  TURN_TIMEOUT: number
  // _id: number
  hand: number
  action: number
  timestamp: number
  tableId: number
  isNoRaise: boolean = false
  type: TableType = 'CASH'
  state: 'PENDING' | 'PLAYING' = 'PENDING'
  bb: number = 0
  pot: number = 0
  // leftPlayers: LeftPlayer[] = []
  sbIndex: number = -1
  bbIndex: number = -1
  buttonIndex: number = -1
  turnIndex: number = -1
  toCall = NaN
  winners: Winner[] = []
  sidePots: number[] = []
  minbet: number = 0
  allinShowdown: boolean = false
  allinShowdownNextHand: boolean = false
  done: boolean = false
  prev: PrevAction | null = null
  showdown: Showdown[] = []
  winarr: any[] = []
  isLast: boolean = false

  static from(round: Prisma.JsonValue) {
    return Object.assign(new Round(), round)
  }

  constructor(opts?: RoundOptions) {
    super()
    if (opts) {
      this.tableId = opts.tableId
      this.bb = opts.bb
      this.type = opts.type || 'CASH'
      this.TURN_TIMEOUT = opts.turnTimeout
      this.players = opts.players
        ? opts.players.map((username) => ({
            bet: 0,
            cards: [],
            chips: opts.chips || 1500,
            limit: 0,
            username
          }))
        : []
    }
    // this._id = 0
  }

  public nextHand() {
    if (this.players.filter((player) => !player.isSitOut).length < 2) {
      this.state = 'PENDING'
      this.players = this.players.map((player) => ({
        ...player,
        cards: [],
        bet: 0
      }))
      this.commonReset()
      this.pendingReset()
      return this
    }

    this.increaseBbIfShould()
    this.sbIndex = this.getIndex(this.sbIndex + 1, ['isWaitingForBB', 'isSitOut'])
    this._start()
    return this
  }

  private commonReset() {
    this.winners = []
    this.board = []
    this.allinShowdown = false
    this.done = false
    this.prev = null
    this.showdown = []
    // this.leftPlayers = []
    this.isNoRaise = false
    this.resetLimits()
    this.sidePots = []
  }

  private pendingReset() {
    this.pot = 0
  }

  private _start() {
    this.state = 'PLAYING'
    this.hand = Date.now()
    this.action = 0
    this.bb = this.getCurrentBb()
    this.bbIndex = this.getIndex(this.sbIndex + 1, ['isSitOut'])
    // this.turnIndex = this.excludeWaitingForBBAndSitOut(this.bbIndex + 1)
    this.deck = this.drawCards(52, [...SORTED_CARDS_PACK])
    this.commonReset()
    this.players = this.players
      .filter((player) => !player.isLeaving)
      .filter((player) => !player.isLeft)
      .map((player, i) => {
        const isSB = i === this.sbIndex
        const isBB = i === this.bbIndex

        const isWaitingForBB = player.isWaitingForBB && !isBB ? { isWaitingForBB: true } : {}
        const isSitOut = player.isSitOut ? { isSitOut: true } : {}
        const isActive = !player.isWaitingForBB && !player.isSitOut ? { isActive: true } : {}
        const isOut = player.isWaitingForBB || player.isSitOut ? { isOut: true } : {}
        const isLeaving = player.isLeaving ? { isLeaving: true } : {}

        const bet = Math.min(isSB ? this.bb / 2 : isBB ? this.bb : 0, player.chips)
        const isDone = bet === player.chips ? { isDone: true } : {}

        return {
          username: player.username,
          chips: player.chips - bet,
          bet,
          limit: 0,
          cards: isActive.isActive ? this.drawCards(2) : [],
          ...isDone,
          ...isOut,
          ...isWaitingForBB,
          ...isSitOut,
          ...isActive,
          ...isLeaving
        }
      })

    this.setInitialTurnIndex()
    this.setToCall()
    this.setPot()
    this.setMinBet()
    this.checkAllinShowdownPre()
    this.print()
    this.setTimeStamp()
  }

  public getWinner() {
    const winner = this.players.filter((player) => !player.isLeft)
    if (winner.length !== 1) throw new Error('Invalid invocation of getWinner() method')
    return winner[0]
  }

  public skipAction() {
    if (typeof this.turnIndex !== 'number') return null
    const hero = this.players[this.turnIndex]
    let value = 0
    if (this.getAllBets().length) {
      value = -1
    }
    return this.takeAction(hero.username, value)
  }

  public takeAction(username: string, value: number) {
    this.hero = this.players[this.turnIndex]
    if (this.hero.username !== username) return null

    this.action++
    this.hero.isDone = true

    switch (value) {
      case -1: {
        this.resolveFold()
        break
      }
      case 0: {
        this.resolveCheckOrCall()
        break
      }
      default: {
        this.resolveBet(value)
        break
      }
    }
    this.nextTurnOrStartNextStreet()
    this.setTimeStamp()
    return this
  }

  private resolveBet(value: number) {
    if (value < this.minbet) {
      return
    }
    this.prev = {
      username: this.hero.username,
      type: value === this.hero.chips ? 'ALL IN' : this.getAllBets().length ? 'RAISE' : 'BET'
    }
    this.resetIsDoneAfterBet()
    this.hero.chips -= value - this.hero.bet
    this.pot += value - this.hero.bet
    this.hero.bet = value
  }

  private resolveFold() {
    this.prev = {
      username: this.hero.username,
      type: 'FOLD'
    }
    this.hero.isOut = true
  }

  private resolveCheckOrCall() {
    const maxBet = this.getMaxBet()
    if (maxBet > 0) {
      this.setPrev(this.hero.username, 'CALL')
      this.pot += this.toCall
      this.hero.chips -= this.toCall
      this.hero.bet += this.toCall
    } else {
      this.setPrev(this.hero.username, 'CHECK')
    }
  }

  private setNextTurnIndex() {
    this.turnIndex = this.getNextPlayerIndex()
  }

  private setIsLast() {
    if (typeof this.turnIndex !== 'number') {
      this.isLast = false
      return
    }
    this.players[this.turnIndex].isDone = true
    this.isLast = typeof this.getNextPlayerIndex() !== 'number'
    this.players[this.turnIndex].isDone = false
  }

  private nextTurnOrStartNextStreet() {
    const playersNotOut = this.getPlayersNotOut()

    if (playersNotOut.length === 1) {
      this.clearBets()
      this.winners.push({
        username: playersNotOut[0].username,
        amount: this.pot,
        isHighlighted: true
      })
      playersNotOut[0].chips += this.pot
      this.turnIndex = null
      this.done = true
      return this
    }

    this.setNextTurnIndex()
    this.setIsLast()

    this.setLimits()

    this.checkAllinShowdownPost()
    if (this.allinShowdown) {
      this.action++
      // this.setLimits()
      return this
    }

    if (typeof this.turnIndex === 'number') {
      this.setMinBet()
      this.setToCall()
    } else {
      this.resetBeforeStart()
      this.nextStreet()
    }
    this.print()
    return this
  }

  public setTimeStamp() {
    this.timestamp = Date.now()
    return this
  }

  private setLimits() {
    if (typeof this.turnIndex === 'number') return
    const players = this.getPlayersNotOut().filter((player) => !player.chips && !player.limit)

    players.forEach((player) => {
      player.limit =
        this.pot -
        this.players
          .filter((_) => _.username !== player.username)
          .reduce((acc, cur) => acc + Math.max(cur.bet - player.bet, 0), 0)
      player.limit = player.limit === this.pot ? 0 : player.limit
    })

    // this.sidePots = players.map((player) => 1)
  }

  private resetLimits() {
    for (const player of this.players) {
      player.limit = 0
    }
  }

  private setToCall() {
    if (!this.getAllBets().length) {
      this.toCall = 0
      return
    }

    const maxBet = this.getMaxBet()
    const next = this.players[this.turnIndex]

    this.toCall = Math.min(maxBet - next.bet, next.chips)
  }

  private setIsNoRaise() {}

  private checkAllinShowdownPost() {
    if (this.allinShowdown) return

    const notOut = this.getPlayersNotOut()
    const withChips = notOut.filter((player) => player.chips)
    const bets = this.players.filter((_) => _.username !== this.hero.username).map((_) => _.bet)
    const noNextAction = typeof this.turnIndex !== 'number' || this.players[this.turnIndex].isDone
    const nextActionNotNeeded =
      typeof this.turnIndex === 'number' &&
      withChips[0] === this.players[this.turnIndex] &&
      withChips[0].bet >= Math.max(...bets)

    if (
      notOut.length >= 2 &&
      withChips.length <= 1 &&
      this.hero.bet <= Math.max(...bets) &&
      (noNextAction || nextActionNotNeeded)
    ) {
      this.allinShowdown = true
      // this.turnIndex = NaN
      this.getPlayersNotOut().forEach((player) => {
        this.showdown.push({
          username: player.username,
          cards: player.cards
        })
      })

      this.clearBets()
    }
  }

  private checkAllinShowdownPre() {
    if (this.getPlayersNotOut().length >= 2 && this.getPlayerWithChips().length <= 1 && !this.toCall) {
      if (!this.allinShowdown) {
        this.allinShowdown = true
        // this.turnIndex = NaN
        this.getPlayersNotOut().forEach((player) => {
          this.showdown.push({
            username: player.username,
            cards: player.cards
          })
        })
        this.setLimits()
        this.pot = this.players.reduce((a: number, b) => a + b.limit, 0)
        this.clearBets()
      }
    }
  }

  public nextStreet() {
    switch (this.board.length) {
      case 0: {
        this.createFlop()
        break
      }
      case 3: {
        this.createTurn()
        break
      }
      case 4: {
        this.createRiver()
        break
      }
      case 5: {
        const board = this.board.map(convertCard)
        let winners: any[] = []
        let wincomb: any = null
        const playersHands = this.players
          .filter((_) => !_.isOut)
          .map((_) => ({
            ..._,
            comb: getCombination(_.cards.map(convertCard).concat(board))
          }))
          .sort((a, b) => b.comb.strength.absolute - a.comb.strength.absolute)

        const sorted: typeof playersHands[] = []

        for (let i = 10; i >= 0; i--) {
          const f = playersHands.filter((_) => _.comb.strength.absolute === i)
          if (f.length) {
            sorted.push(playersHands.filter((_) => _.comb.strength.absolute === i))
            sorted[sorted.length - 1].sort((a, b) => b.comb.strength.relative - a.comb.strength.relative)
          }
        }

        const winarr: typeof playersHands[] = []

        for (let i = 0; i < sorted.length; i++) {
          for (let j = 0; j < sorted[i].length; j++) {
            if (
              j - 1 in sorted[i] &&
              sorted[i][j].comb.strength.absolute === sorted[i][j - 1].comb.strength.absolute &&
              sorted[i][j].comb.strength.relative === sorted[i][j - 1].comb.strength.relative
            ) {
              winarr[winarr.length - 1].push(sorted[i][j])
            } else {
              winarr.push([])
              winarr[winarr.length - 1].push(sorted[i][j])
            }
          }
        }

        this.winarr = winarr

        this.winners = getPotSplit(winarr, this.pot)

        this.winners.forEach((winner) => {
          this.players.find((_) => _.username === winner.username).chips += winner.amount
        })

        this.getPlayersNotOut().forEach((player) => {
          if (this.showdown.some((obj) => obj.username === player.username)) return
          this.showdown.push({
            username: player.username,
            cards: player.cards
          })
        })

        this.players.forEach((player) => {
          if (!player.chips) {
            player.isSitOut = true
          }
        })

        if (this.type === 'TOURNEY') {
          this.players = this.players.map((player) => ({
            ...player,
            isLeft: !player.chips
          }))
          // this.leftPlayers = this.players
          //   .filter((player) => !player.chips)
          //   .map((player) => ({
          //     username: player.username,
          //     limit: player.limit
          //   }))
          // this.players = this.players.filter((player) => player.chips)
        }

        this.turnIndex = null
        this.done = true

        break
      }
    }
    this.print()
  }

  private resetBeforeStart() {
    this.clearBets()
    this.setToCall()
    this.resetIsDone()
    this.resetTurnIndex()
    this.setMinBet()
  }

  public shouldTimeoutBeSet() {
    return typeof this.turnIndex === 'number'
  }

  // private resetTurnIndex() {
  //   for (let i = this.bbIndex; i < this.players.length; i++) {
  //     if (!this.players[i].isOut) {
  //       this.turnIndex = i
  //       return
  //     }
  //   }

  //   for (let i = 0; i < this.bbIndex; i++) {
  //     if (!this.players[i].isOut) {
  //       this.turnIndex = i
  //       return
  //     }
  //   }
  // }

  private resetTurnIndex() {
    this.turnIndex = this.getIndex(this.bbIndex, ['isOut', 'isDone'])
  }

  private getNextPlayerIndex() {
    return this.getIndex(this.turnIndex + 1, ['isDone', 'isOut'])
  }

  private verifyAction(username: string) {
    if (this.players.findIndex((_) => _.username === username) !== this.turnIndex) {
      throw new Error('Wrong action due to Turn Index')
    }
  }

  private setInitialTurnIndex() {
    this.turnIndex = this.getIndex(this.bbIndex + 1, ['isWaitingForBB', 'isSitOut', 'isDone'])
  }

  private setMinBet() {
    if (typeof this.turnIndex !== 'number') return

    const bets = Array.from(new Set(this.getAllBets()))
    const next = this.players[this.turnIndex]
    const otherNotOut = this.getPlayersNotOut().filter((player) => player.username !== next.username)

    let maxBet = Infinity
    if (otherNotOut.every((player) => !player.chips)) {
      maxBet = Math.max(...otherNotOut.map((_) => _.bet))
    }

    if (!bets.length) {
      this.minbet = Math.min(this.bb, next.chips + next.bet)
    }

    if (bets.length === 1) {
      this.minbet = Math.min(bets[0] * 2, next.chips + next.bet)
    }

    if (bets.length > 1) {
      this.minbet = Math.min(bets[0] * 2 - bets[1], next.chips + next.bet)
      // this.minbet = Math.min(next.bet + bets[0] - bets[1], next.chips + next.bet)
    }

    if (bets[0] === this.bb) {
      this.minbet = Math.min(this.bb * 2, next.chips + next.bet)
    }

    if (!this.board.length && typeof this.turnIndex !== 'number') {
      this.minbet = Math.min(Math.max(this.minbet, this.bb * 2), next.chips + next.bet)
    }

    this.minbet = Math.min(this.minbet, maxBet)
  }

  public begin() {
    this.sbIndex = Math.floor(Math.random() * this.players.length)
    this._start()
    this.setTimeStamp()
    return this
  }

  addPlayer(username: string, chips: number) {
    const hero = this.players.find((player) => player.username === username)
    if (hero) {
      hero.isLeaving = false
      hero.isSitOut = false
      return this
    }

    this.players.push({
      username,
      chips,
      isOut: true,
      isDone: true,
      bet: 0,
      cards: [],
      limit: Infinity,
      isWaitingForBB: false,
      isSitOut: false,
      isLeaving: false
    })

    if (this.players.length === 2) {
      this.sbIndex = Math.floor(Math.random() * this.players.length)
      this._start()
    }
    if (this.players.length > 2) {
      this.players[this.players.length - 1].isWaitingForBB = true
    }

    this.print()

    return this
  }

  removePlayer(username: string) {
    this.players = this.players.filter((player) => player.username !== username)

    const remaining = this.getPlayersNotOut()

    if (remaining.length === 1) {
      this.clearBets()
      this.players = this.players.map((player) => ({ ...player, cards: [] }))
      this.players.find((player) => player.username === remaining[0].username).chips += this.pot
      this.board = []
      this.pot = 0
      this.turnIndex = null
      this.done = true
    }

    return this
  }

  private print() {
    if (process.env.NODE_ENV === 'development') {
      const obj = {
        players: this.players.map((player) => ({
          ...player,
          cards: player.cards.map(fromNumToScreen).join(' ')
        })),
        // leftPlayers: this.leftPlayers,
        bb: this.bb,
        pot: this.pot,
        board: this.board.map(fromNumToScreen).join(' '),
        sbIndex: this.sbIndex,
        bbIndex: this.bbIndex,
        turnIndex: this.turnIndex,
        minbet: this.minbet,
        toCall: this.toCall,
        prev: this.prev,
        winners: this.winners,
        showdown: this.showdown,
        done: this.done,
        allinShowdown: this.allinShowdown,
        winarr: this.winarr
      }
      // appendFileSync(`${process.cwd()}/hands/hand${this.hand}.json`, JSON.stringify(obj, null, 2))
    }
  }

  private setPrev(username: string, type: PrevAction['type']) {
    this.prev = {
      username,
      type
    }
  }
}
