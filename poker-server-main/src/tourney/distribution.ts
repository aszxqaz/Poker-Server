type Player = {
  username: string
}

export const getDistribution = <T extends any>(count: number, players: T[]) => {
  const tables_count = Math.ceil(players.length / count)
  const average_sit = Math.floor(players.length / tables_count)
  const remainder = (players.length % tables_count) / tables_count

  let from = 0
  let total = players.length
  let transitive = 0

  // console.log(`average_sit: ${average_sit}`)
  // console.log(`tables_count: ${tables_count}`)
  // console.log(`remainder: ${remainder}`)

  return new Array(tables_count).fill({}).map((table) => {
    transitive += remainder
    const toAdd = Math.trunc(+transitive.toFixed(2))
    transitive -= toAdd
    // console.log(`toAdd: ${toAdd}`)
    // console.log(`transitive: ${transitive}`)
    const to = from + average_sit + +toAdd.toFixed(2)
    // console.log(`from: ${from}; to: ${to}`)
    const _players = players.slice(from, to)
    from = to
    return _players
  })
}

// console.log(getDistribution(6, new Array(13).fill({ username: 'Maxim' })))
