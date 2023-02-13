export function convertCard(num: number) {
  return [(num - (num % 4)) / 4, num % 4]
}

const Suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs']
const Ranks = [
  'Deuce',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Jack',
  'Queen',
  'King',
  'Ace'
]



const sortDesc = (cards: number[][]) => {
  return cards.sort((a, b) => b[0] - a[0])
}

export const getCombination = (cards: number[][]) => {
  const sorted = sortDesc(cards)
  const fns = [
    getRoyalFlush,
    getStraightFlush,
    getFourOfAKind,
    getFullHouse,
    getFlush,
    getStraight,
    getThreeOfAKind,
    getTwoPair,
    getPair,
    getHighCard
  ]
  for (let i = 0; i < fns.length; i++) {
    const fn = fns[i]
    const combination = fn(sorted)
    if (combination) return combination
  }
  return {
    message: '',
    strength: {
      absolute: -1,
      relative: 0
    }
  }
}

const filterMoreThanFourSuit = (sorted: number[][]): number[][] | null => {
  let filtered: number[][] = []
  for (let i = 0; i < 4; i++) {
    filtered = sorted.filter((_) => _[1] === i)
    if (filtered.length > 4) break
  }
  if (filtered.length < 5) return null
  return filtered
}

const getRoyalFlush = (sorted: number[][]) => {
  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered || filtered[0][0] !== 12) return null

  for (let i = 1; i < 5; i++) if (filtered[i][0] !== filtered[i - 1][0] - 1) return null

  return {
    message: `Royal Flush of ${Suits[filtered[0][1]]}s.`,
    strength: {
      absolute: 9,
      relative: 0
    }
  }
}

const getStraightFlush = (sorted: number[][]) => {
  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered) return null

  let startIndex = 0
  let count = 1

  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i][0] === filtered[i - 1][0] - 1) {
      if (++count === 5) {
        return {
          message: `Straight Flush. From ${Ranks[filtered[startIndex + 4][0]]} to ${
            Ranks[filtered[startIndex][0]]
          }.`,
          strength: {
            absolute: 8,
            relative: filtered[startIndex + 4][0] + 1
          }
        }
      }
    } else {
      startIndex++
      count = 1
    }
    // if (5 - count > filtered.length - i) return false
  }

  const len = filtered.length

  if (
    filtered[0][0] === 12 && // A
    filtered[len - 1][0] === 0 && // 2
    filtered[len - 2][0] === 1 && // 3
    filtered[len - 3][0] === 2 && // 4
    filtered[len - 4][0] === 3 // 5
  ) {
    return {
      message: `Straight Flush, from Ace to Five
      }.`,
      strength: {
        absolute: 8,
        relative: 0
      }
    }
  }
}

const getFourOfAKind = (sorted: number[][]) => {
  let count = 1
  let isKickerFirst = false

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] === sorted[i - 1][0]) {
      count++
      if (count === 4) {
        const kickerIndex = isKickerFirst ? 0 : i + 1
        return {
          message: `Four of a Kind, ${Ranks[sorted[i][0]]}s. Kicker ${
            Ranks[sorted[kickerIndex][0]]
          }.`,
          strength: {
            absolute: 7,
            relative: sorted[i][0] * 1e3 + sorted[kickerIndex][0]
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

const getFullHouse = (sorted: number[][]) => {
  let couple: null | number = null
  let triple: null | number = null
  let temp: null | number = null
  let count = 1

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] === sorted[i - 1][0]) {
      if (++count === 2) {
        if (couple === null || triple !== null) {
          couple = sorted[i][0]
        } else {
          temp = sorted[i][0]
        }
      }
      if (count === 3) {
        if (triple !== null) {
          couple = sorted[i][0]
        } else {
          triple = sorted[i][0]
          if (triple === couple) couple = null
        }
        count = 1
      }
    } else {
      count = 1
    }

    if (couple === null && triple === null && i > sorted.length - 4) return false

    if (couple !== null && triple !== null)
      return {
        message: `Full House, ${Ranks[triple]}s and ${Ranks[couple]}s.`,
        strength: {
          absolute: 6,
          relative: triple * 1e6 + couple * 1e3
        }
      }
  }

  return false
}

const getFlush = (sorted: number[][]) => {
  const filtered = filterMoreThanFourSuit(sorted)
  if (!filtered) return null

  return {
    message: `Flush of ${Suits[filtered[0][1]]}.`,
    strength: {
      absolute: 5,
      relative: filtered
        .slice(0, 5)
        .reduce((acc, val, i) => (acc + val[0] * 100) ^ (5 - i), 0)
    }
  }
}

const getStraight = (sorted: number[][]) => {
  let count = 1
  let startIndex = 0
  let unduped = Array.from(new Set(sorted.map((_) => _[0])))

  for (let i = 1; i < unduped.length; i++) {
    if (unduped[i] === unduped[i - 1] - 1) {
      count++
      if (count === 5) {
        return {
          message: `Straight, from ${Ranks[unduped[startIndex + 4]]} to ${
            Ranks[unduped[startIndex]]
          }.`,
          strength: {
            absolute: 4,
            relative: unduped[startIndex + 4] + 1
          }
        }
      }
    } else {
      count = 1
      startIndex++
    }
    // if (4 - count > unduped.length - i) return false
  }

  const len = unduped.length

  if (
    unduped[0] === 12 && // A
    unduped[len - 1] === 0 && // 2
    unduped[len - 2] === 1 && // 3
    unduped[len - 3] === 2 && // 4
    unduped[len - 4] === 3 // 5
  ) {
    return {
      message: `Straight, from Ace to Five.`,
      strength: {
        absolute: 4,
        relative: 0
      }
    }
  }

  return false
}

const getThreeOfAKind = (sorted: number[][]) => {
  let count = 1
  let startIndex = 0

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] === sorted[i - 1][0]) {
      if (++count === 3) {
        const kickerIndeces =
          startIndex === 0 ? [3, 4] : startIndex === 1 ? [0, 4] : [0, 1]
        const kickerRanks = [sorted[kickerIndeces[0]][0], sorted[kickerIndeces[1]][0]]

        return {
          message: `Three of a Kind, ${Ranks[sorted[i][0]]}s. Kickers: ${
            Ranks[kickerRanks[0]]
          }, ${Ranks[kickerRanks[1]]}.`,
          strength: {
            absolute: 3,
            relative:
              sorted[i][0] * 1e6 +
              (Math.max(...kickerRanks) + 1) * 1e3 +
              Math.min(...kickerRanks)
          }
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

const getTwoPair = (sorted: number[][]) => {
  const pairs: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] === sorted[i - 1][0]) {
      pairs.push(sorted[i][0])
      if (pairs.length === 2) {
        let kickerIndex = 0
        while (pairs.includes(sorted[kickerIndex][0])) {
          kickerIndex++
        }
        return {
          message: `Two Pair, ${Ranks[pairs[0]]}s and ${Ranks[pairs[1]]}s. Kicker: ${
            Ranks[sorted[kickerIndex][0]]
          }`,
          strength: {
            absolute: 2,
            relative:
              Math.max(...pairs) * 1e4 +
              (Math.min(...pairs) + 1) * 1e2 +
              sorted[kickerIndex][0]
          }
        }
      }
    }
  }
}

const getPair = (sorted: number[][]) => {
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][0] === sorted[i - 1][0]) {
      const rest = ([] as number[][])
        .concat(sorted.slice(0, i - 1), sorted.slice(i + 1))
        .slice(0, 3)
      return {
        message: `Pair of ${Ranks[sorted[i][0]]}s.`,
        strength: {
          absolute: 1,
          relative:
            (sorted[i][0] + 1) * 1e6 +
            (rest[0][0] + 1) * 1e4 +
            (rest[1][0] + 1) * 1e2 +
            rest[2][0]
        }
      }
    }
  }
}

const getHighCard = (sorted: number[][]) => {
  return {
    message: `High Card: ${Ranks[sorted[0][0]]}.`,
    strength: {
      absolute: 0,
      relative: sorted
        .slice(0, 5)
        .reduce((acc, cur, i) => (acc + (cur[0] + 1) * 100) ^ (4 - i), 0)
    }
  }
}

// export const createDeck = () => {
//   const deck: number[][] = []
//   for (let rank = 0; rank < 13; rank++) {
//     for (let suit = 0; suit < 4; suit++) {
//       deck.push(new Card(rank, suit))
//     }
//   }
//   return deck
// }

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
