const winarr = [
  [
    {
      username: 'B',
      limit: 4500
    },
    {
      username: 'B',
      limit: 4500
    }
  ],
  [
    {
      username: 'A',
      limit: 1000
    }
  ],
  [
    {
      username: 'C',
      limit: 2310
    }
  ]
]

function getPotSplit(winarr: { username: string; limit: number }[][], pot: number) {
  const winners = []
  let available = pot
  let unavailable = 0
  let maxLimit = 0

  for (const hands of winarr) {
    let sum = 0

    const sorted = hands
      .map((hand) => ({ ...hand, limit: !hand.limit ? pot : hand.limit }))
      .sort((b, a) => a.limit - b.limit) // 600 1100 1300
    console.log(`sorted: ${sorted.map((a) => a.limit)}`)

    for (const hand of hands) {
      console.log(`--LIMIT: ${hand.limit}`)
      // 1300

      let lessOrEqual = hands
        .filter((_) => _.limit <= hand.limit && _.limit > maxLimit)
        .map((_) => _.limit)
        .sort((a, b) => a - b)

      // lessOrEqual = maxLimit > 0 ? [maxLimit, ...lessOrEqual] : lessOrEqual

      console.log(`less or equal: ${lessOrEqual}`)

      const dividers = lessOrEqual.map((_h) => hands.filter((_) => _.limit >= _h).length)
      console.log(dividers)

      let won = 0

      for (let i = 0; i < lessOrEqual.length; i++) {
        won += i === 0 ? (lessOrEqual[i] - maxLimit) / dividers[i] : (lessOrEqual[i] - lessOrEqual[i - 1]) / dividers[i]
      }

      console.log(won)

      winners.push({
        username: hand.username,
        amount: won
      })

      sum += won
    }

    maxLimit = Math.max(sorted[0].limit, maxLimit)
    console.log(`maxLimit: ${maxLimit}`)
    unavailable += sum
  }
  return winners
}
