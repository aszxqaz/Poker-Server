type Strength = {
  absolute: number
  relative: number
}

class Hand {
  strength: Strength

  constructor(a: number, b: number) {
    this.strength = {
      absolute: a,
      relative: b
    }
  }
}

export const hands = [
  new Hand(1, 3),
  new Hand(2, 3),
  new Hand(1, 3),
  new Hand(4, 8),
  new Hand(3, 1),
  new Hand(4, 8),
  new Hand(2, 3)
]

const sorted: Hand[][] = []

hands.sort((a, b) => b.strength.absolute - a.strength.absolute)

console.log(`Hands: ${JSON.stringify(hands, null, 2)}`)

for (let i = 10; i > 0; i--) {
  const f = hands.filter((_) => _.strength.absolute === i)
  if (f.length) {
    sorted.push(hands.filter((_) => _.strength.absolute === i))
    sorted[sorted.length - 1].sort((a, b) => b.strength.relative - a.strength.relative)
  }
}

console.log(`Sorted: ${JSON.stringify(sorted, null, 2)}`)

const result = sorted.filter((_) => _.length)

console.log(`Result: `, JSON.stringify(result, null, 2))

const arr: Hand[][] = []


for (let i = 0; i < result.length; i++) {
  for (let j = 0; j < result[i].length; j++) {
    if (
      j - 1 in result[i] &&
      result[i][j].strength.absolute === result[i][j - 1].strength.absolute &&
      result[i][j].strength.relative === result[i][j - 1].strength.relative
    ) {
      arr[arr.length - 1].push(result[i][j])
    } else {
      arr.push([])
      arr[arr.length - 1].push(result[i][j])
    }
  }
}

console.log(`Result: ${JSON.stringify(arr, null, 2)}`)
