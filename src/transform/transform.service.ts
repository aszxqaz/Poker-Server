import { Injectable } from '@nestjs/common'
import { Round } from 'src/round/round'
import {
  EmittableTable,
  TableWithPlayersUsers,
  TableWithPlayersUsersObservers
} from 'src/table/table.types'
import {
  DetailedCashTable,
  DetailedTourney,
  FlatCashTable,
  FlatTourney
} from 'src/types/cashtable'

@Injectable()
export class TransformService {
  toFlatCashTable(...cashTables: DetailedCashTable[]): FlatCashTable[] {
    return cashTables.map((cashTable) => {
      const { tableId, bb, name, table, stack, tableSize } = cashTable
      return {
        id: tableId,
        bb,
        name,
        playersCount: table.players.length,
        players: table.players.map((player) => ({ username: player.username })),
        stack,
        state: table.state,
        tableSize
      }
    })
  }

  toFlatTourney(...tourneys: DetailedTourney[]): FlatTourney[] | FlatTourney {
    const transformed = tourneys.map((tourney) => {
      const {
        id,
        buyin,
        name,
        prizes,
        speed,
        chips,
        startedAt,
        state,
        tableSize,
        type,
        entries,
        placings,
        tables
      } = tourney
      return {
        id,
        buyin,
        name,
        prizes,
        speed,
        chips,
        startedAt: startedAt?.getTime() || null,
        state,
        tableSize,
        type,
        entries: entries.map((entry) => entry.username),
        placings: placings.map((placing) => ({
          amount: placing.amount,
          place: placing.place,
          username: placing.username
        })),
        tables: tables.map((table) => ({
          id: table.id,
          players: table.players.map((player) => ({
            username: player.username,
            chips: player.chips
          }))
        }))
      }
    })

    return transformed.length === 1 ? transformed[0] : transformed
  }

  // public formatTableToEmit(table: TableWithPlayersUsersObservers): EmittableTable {
  //   return {
  //     id: table.id,
  //     name: table.name,
  //     players: table.players.map((player) => ({
  //       username: player.username,
  //       avatar: player.user.avatar
  //     })),
  //     type: table.type
  //   }
  // }

  public formatRoundForRoundPlayer(round: Round, username: string) {
    return {
      ...this.getCommonFrontendRound(round),
      ...this.getSpecificFrontendRound(round, username)
    }
  }

  public formatTableForRoundPlayer(table: TableWithPlayersUsers) {
    return {
      id: table.id,
      tourneyId: table.tourneyId,
      name: table.name,
      type: table.type,
      state: table.state,
      tableSize: table.tableSize,
      players: table.players.map((player) => ({
        chips: player.chips,
        username: player.username,
        avatar: player.user.avatar
      }))
    }
  }

  public formatTableAndRound(
    table: TableWithPlayersUsers,
    round: Round,
    username: string
  ) {
    return {
      ...this.formatTableForRoundPlayer(table),
      round: this.formatRoundForRoundPlayer(round as unknown as Round, username)
    }
  }

  public getCommonFrontendRound(round: Round) {
    if (!round) return null
    const {
      hand,
      bb,
      bbIndex,
      board,
      buttonIndex,
      pot,
      minbet,
      prev,
      sbIndex,
      timestamp,
      state,
      winners,
      turnIndex,
      isLast,
      toCall,
      allinShowdown,
      showdown,
      TURN_TIMEOUT,
      done
    } = round
    return {
      hand,
      board: board.map(this.convertCard),
      allinShowdown,
      done,
      bb,
      pot,
      sbIndex,
      prev,
      bbIndex,
      state,
      buttonIndex,
      TURN_TIMEOUT,
      turnIndex,
      isLast,
      timestamp,
      toCall,
      minbet,
      showdown: showdown.map((info) => ({
        ...info,
        cards: info.cards.map(this.convertCard)
      })),
      winners,
      players: round.players.map((player, i) => ({
        username: player.username,
        chips: player.chips,
        bet: player.bet,
        isBB: i === round.bbIndex,
        isSB: i === round.sbIndex,
        isDone: player.isDone,
        isOut: player.isOut,
        isSitOut: player.isSitOut,
        isTurn: i === turnIndex,
        limit: player.limit
      }))
    }
  }

  public getSpecificFrontendRound(round: Round, username: string) {
    if (!round) return null

    let cards = []

    const hero = round.players.find((player) => player.username === username)

    if (hero && hero.cards.length) {
      cards = [this.convertCard(hero.cards[0]), this.convertCard(hero.cards[1])]
    }

    return {
      cards,
      isHeroTurn: hero && round.players[round.turnIndex]?.username === hero.username,
      isWaitingForBB: hero && hero.isWaitingForBB,
      isSitOut: hero && hero.isSitOut
    }
  }

  public convertCard(num: number) {
    return [(num - (num % 4)) / 4, num % 4]
  }
}
