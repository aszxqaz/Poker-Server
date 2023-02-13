export function getPotSplit(winarr: { username: string; limit: number }[][], pot: number) {
  const winners = []
  let available = pot
  let unavailable = 0
  let maxLimit = 0

  for (const hands of winarr) {
    let sum = 0

    const sorted = hands
      .map((hand) => ({ ...hand, limit: !hand.limit ? pot : hand.limit }))
      .sort((b, a) => a.limit - b.limit) // 600 1100 1300

    for (const hand of sorted) {
      let lessOrEqual = sorted
        .filter((_) => _.limit <= hand.limit && _.limit > maxLimit)
        .map((_) => _.limit)
        .sort((a, b) => a - b)

      const dividers = lessOrEqual.map((_h) => sorted.filter((_) => _.limit >= _h).length)

      let won = 0

      for (let i = 0; i < lessOrEqual.length; i++) {
        won += i === 0 ? (lessOrEqual[i] - maxLimit) / dividers[i] : (lessOrEqual[i] - lessOrEqual[i - 1]) / dividers[i]
      }

      winners.push({
        username: hand.username,
        amount: won,
        isHighlighted: !maxLimit
      })

      sum += won
    }

    maxLimit = Math.max(sorted[0].limit, maxLimit)
    unavailable += sum
  }
  return winners
}
