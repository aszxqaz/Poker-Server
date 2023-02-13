import { SORTED_CARDS_PACK } from '../constants'

export class DeckRound {
  deck = [] as number[]
  board = [] as number[]

  protected drawCards(num: number, pack?: number[]): number[] {
    const cards: number[] = []
    const deck = pack || this.deck
    for (let i = 0; i < num; i++) {
      const rand = Math.floor(Math.random() * deck.length)
      const card = deck.splice(rand, 1)[0]
      cards.push(card)
    }
    return cards
  }

  protected createDeck() {
    this.deck = this.drawCards(52, [...SORTED_CARDS_PACK])
  }

  protected createFlop() {
    this.board.push(...this.drawCards(3))
  }

  protected createTurn() {
    this.board.push(...this.drawCards(1))
  }

  protected createRiver() {
    this.board.push(...this.drawCards(1))
  }
}
