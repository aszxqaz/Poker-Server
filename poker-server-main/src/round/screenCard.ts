export class ScreenCard {
  constructor(public rank: number, public suit: number) {}

  toString() {
    let srank = this.rank < 9 ? this.rank + 2 : ['J', 'Q', 'K', 'A'][this.rank - 9]
    let ssuit = ['♠', '♡', '♦', '♣']
    return `${ssuit[this.suit]}${srank}`
  }
}

export function fromNumToScreen(num: number) {
  const card = convertCard(num)
  return new ScreenCard(card[0], card[1]).toString()
}

function convertCard(num: number) {
  return [(num - (num % 4)) / 4, num % 4]
}