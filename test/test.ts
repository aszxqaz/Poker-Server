const START_BLIND = 20
const INCREASE = 10
const COLS = 3

const INCREASES = [null, 10, 30, 60, 100, 150, 200, 300, 500, 800, 1200]

const increaseFn = (row: number) => {
  return INCREASES[row]
}


export const getBlindSizes = (level: number, speed?: 1 | 2 | 3) => {
  const raw = level / COLS
  const row = Math.floor(level / COLS)
  const col = level % COLS

  let res = START_BLIND

  for(let i = 0; i < row; i++) {
    res += increaseFn(i + 1) * COLS
  }

  res += col * increaseFn(row + 1)
  
  return res
}


for(let i = 0; i < 50; i++) {
  
  console.log(`Level ${i}: ${getBlindSizes(i)}`)
}