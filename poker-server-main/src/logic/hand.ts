class Card {
  constructor(public rank: number, public suit: number) { }

  toString() {
    let srank = this.rank < 9 ? this.rank + 2 : ['J', 'Q', 'K', 'A'][this.rank - 9];
    let ssuit = ['♠', '♡', '♦', '♣']
    return `${ssuit[this.suit]}${srank}`;
  }
}

const Suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs']
const Ranks = ['Deuce', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Jack', 'Queen', 'King', 'Ace']

const sortDesc = (cards: Card[]) => {
  return cards.sort((a, b) => b.rank - a.rank);
}

const getCombination = (cards: Card[]) => {
  const sorted = sortDesc(cards)
  const fns = [getRoyalFlush, getStraightFlush, getFourOfAKind, getFullHouse, getFlush, getStraight, getThreeOfAKind, getTwoPair, getPair, getHighCard]
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i]
    const combination = fn(sorted)
    if (combination) return combination
  }
  return {
    message: 'No ready hand'
  }
}

const filterMoreThanFourSuit = (sorted: Card[]): Card[] | null => {
  let filtered = []
  for (let i = 0; i < 4; i++) {
    filtered = sorted.filter(c => c.suit === i)
    if (filtered.length > 4) break
  }
  if (filtered.length < 5) return null
  return filtered
}

const getRoyalFlush = (sorted: Card[]) => {

  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered || filtered[0].rank !== 12) return null

  for (let i = 1; i < 5; i++)
    if (filtered[i].rank !== filtered[i - 1].rank - 1) return null

  return {
    message: `Royal Flush of ${Suits[filtered[0].suit]}s.`,
    strength: {
      absolute: 9,
      relative: 0
    }
  }
}

const getStraightFlush = (sorted: Card[]) => {

  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered) return null

  let startIndex = 0
  let count = 1

  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i].rank === filtered[i - 1].rank - 1 || (sorted[i].rank === 0 && sorted[i - 1].rank === 12)) {
      if (++count === 5) {
        return {
          message: `Straight Flush. From ${Suits[filtered[startIndex].rank + 4]} to ${Suits[filtered[startIndex].rank]}.`,
          strength: {
            absolute: 8,
            relative: filtered[startIndex].rank
          }
        }
      }
    } else {
      startIndex++
      count = 1
    }
    if (5 - count > filtered.length - i) return false
  }
}

const getFourOfAKind = (sorted: Card[]) => {
  let count = 1
  let isKickerFirst = false

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank) {
      count++
      if (count === 4) {
        const kickerIndex = isKickerFirst ? 0 : i + 1
        return {
          message: `Four of a Kind, ${Ranks[sorted[i].rank]}s. Kicker ${Ranks[sorted[kickerIndex].rank]}.`,
          strength: {
            absolute: 7,
            relative: sorted[i].rank * 1e3 + sorted[kickerIndex].rank
          }
        }
      }
    } else {
      isKickerFirst = true
      count = 1
    }
    // 0 1 3 4 5 6 7
    if (5 - count > sorted.length - i) return false
  }
}

const getFullHouse = (sorted: Card[]) => {
  let couple: null | number = null
  let triple: null | number = null
  let temp: null | number = null
  let count = 1

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank) {
      if (++count === 2) {
        if (couple === null || triple !== null) {
          couple = sorted[i].rank
        } else {
          temp = sorted[i].rank
        }
      }
      if (count === 3) {
        if (triple !== null) {
          couple = sorted[i].rank
        } else {
          triple = sorted[i].rank
          if (triple === couple) couple = null
        }
        count = 1
      }
    } else {
      count = 1
    }

    if (couple === null && triple === null && i > sorted.length - 4) return false

    if (couple !== null && triple !== null) return {
      message: `Full House, ${Ranks[triple]}s and ${Ranks[couple]}s.`,
      strength: {
        absolute: 6,
        relative: triple * 1e6 + couple * 1e3
      }
    }
  }

  return false
}

const getFlush = (sorted: Card[]) => {

  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered) return null

  return {
    message: `Flush of ${Suits[filtered[0].suit]}.`,
    strength: {
      absolute: 5,
      relative: filtered.slice(0, 5).reduce((acc, val, i) => acc + val.rank * 100 ^ (5 - i), 0)
    }
  }
}

const getStraight = (sorted: Card[]) => {
  let count = 1;
  let startIndex = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank - 1 || (sorted[i].rank === 0 && sorted[i - 1].rank === 12)) {
      if (++count === 5) {
        return {
          message: `Straight, from ${Ranks[sorted[startIndex + 4].rank]} to ${Ranks[sorted[startIndex].rank]}.`,
          strength: {
            absolute: 4,
            relative: sorted[startIndex].rank
          }
        }
      }
    } else {
      count = 1
      startIndex++
    }
    if (5 - count > sorted.length - i) return false
  }
  return false
}

const getThreeOfAKind = (sorted: Card[]) => {
  let count = 1
  let startIndex = 0

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank) {
      if (++count === 3) {
        const kickerIndeces = startIndex === 0 ? [3, 4] : startIndex === 1 ? [0, 4] : [0, 1]
        const kickerRanks = [sorted[kickerIndeces[0]].rank, sorted[kickerIndeces[1]].rank]

        return {
          message: `Three of a Kind, ${Ranks[sorted[i].rank]}s. Kickers: ${Ranks[kickerRanks[0]]}, ${Ranks[kickerRanks[1]]}.`,
          strength: 3,
          relative: sorted[i].rank * 1e6 + (Math.max(...kickerRanks) + 1) * 1e3 + Math.min(...kickerRanks)
        }
      }
    } else {
      count = 1
      startIndex++
    }
    // 0 1 3 4 5 3 5
  }
  return false
}

const getTwoPair = (sorted: Card[]) => {
  const pairs = []
  let startIndex = 0

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank) {
      pairs.push(sorted[i].rank)
      if (pairs.length === 2) {
        const kickerIndex = startIndex !== 0 ? 0 : i === 3 ? 4 : 2
        return {
          message: `Two Pair, ${Ranks[pairs[0]]}s and ${Ranks[pairs[1]]}s. Kicker: ${Ranks[sorted[kickerIndex].rank]}`,
          strength: {
            absolute: 2,
            relative: Math.max(...pairs) * 1e6 + (Math.min(...pairs) + 1) * 1e3 + sorted[kickerIndex].rank
            // 12 * 1000 + 1 * 100
            // 11* 1000 + 10 * 100
          }
        }
      }
    } else {
      startIndex++
    }
  }
}

const getPair = (sorted: Card[]) => {
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].rank === sorted[i - 1].rank) {
      const rest = [].concat(sorted.slice(0, i - 1), sorted.slice(i + 2)).slice(0, 3)
      return {
        message: `Pair of ${Ranks[sorted[i].rank]}s.`,
        strength: {
          absolute: 1,
          relative: sorted[i].rank * 1e6 + rest.reduce((acc, cur, i) => acc + (cur.rank + 1) * 100^(2 - i), 0)
        }
      }
    }
  }
}

const getHighCard = (sorted: Card[]) => {
  return {
    message: `High Card: ${Ranks[sorted[0].rank]}.`,
    strength: {
      absolute: 0,
      relative: sorted.slice(0, 5).reduce((acc, cur, i) => acc + (cur.rank + 1) * 100^(4 - i), 0)
    }
  }
}


export const createDeck = () => {
  const deck: Card[] = []
  for (let rank = 0; rank < 13; rank++) {
    for (let suit = 0; suit < 4; suit++) {
      deck.push(new Card(rank, suit))
    }
  }
  return deck
}

export const drawCards = (deck: number[], num: number): number[] => {
  const cards = []
  for (let i = 0; i < num; i++) {
    const rand = Math.floor(Math.random() * deck.length)
    const card = deck.splice(rand, 1)[0]
    cards.push(card)
  }
  return cards
}

export function isValidRank(rank: number) {
  return rank > 1 && rank < 15
}

// function tick() {

//   const deck = createDeck()
//   const board = drawCards(deck, 3)
//   const hand1 = drawCards(deck, 2)
//   const hand2 = drawCards(deck, 2)

//   const now = () => new Date().getTime()
//   const startedAt = now()
//   const comb1 = getCombination(board.concat(hand1))
//   const comb2 = getCombination(board.concat(hand2))
//   const finishedAt = now()

//   console.log('------------------------------------')
//   console.log('------------- OPPONENT -------------')
//   console.log('------------------------------------')
//   console.log('               ' + hand1.join(' '))
//   console.log(' ')
//   console.log(comb1)
//   console.log(' ')
//   console.log('------------------------------------')
//   console.log('--------------- BOARD --------------')
//   console.log('------------------------------------')
//   console.log(' ')
//   console.log('            ' + board.join(' '))
//   console.log(' ')
//   console.log('------------------------------------')
//   console.log('------------------------------------')
//   console.log('------------------------------------')
//   console.log(' ')
//   console.log('               ' + hand2.join(' '))
//   console.log(' ')
//   console.log(comb2)
//   console.log(' ')
//   console.log('------------------------------------')
//   console.log('--------------- HERO ---------------')
//   console.log('------------------------------------')
//   console.log(' ')
//   console.log(' ')
//   console.log(' ')
//   console.log(`Calculations done in ${finishedAt - startedAt} ms`)
// }

// function start() {
//   setInterval(() => {
//     tick()
//   }, 500)
// }

// start()