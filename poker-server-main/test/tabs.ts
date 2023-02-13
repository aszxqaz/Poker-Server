export const tabs = [1, 2, 3]
// tabIndex = 0 | 1 2 3 4 (1) 2 3 4 1 | f(4, 9) = 0
// tabIndex = 1 | 2 3 4 1 (2) 3 4 1 2 | f(9) = 0
// tabIndex = 0 | 2 3 4 (1) 2 3 4 | f(4, 7) = 1
// tabs = [1, 2, 3]
// tabIndex = 0 | 3 1 2 3 (1) 2 3 1 2 | f(3, 9) = 2
const MIN_EXTENDED = 5

const getIndex = (index: number, length: number) => {
  return index < 0 ? length + index : index >= length ? index - length : index
}

export const getExtended = <T extends any>(initial: T[], tabIndex: number, count: number = MIN_EXTENDED): T[] => {
  console.log(`initial: ${initial}`)
  console.log(`count: ${count}`)
  const offset = ((count - 1) / 2) % initial.length
  console.log(`offset: ${offset}`)
  const startIndex = initial.length - offset + tabIndex
  console.log(`startIndex: ${startIndex}`)
  const res: typeof initial = []
  for(let i = 0; i < count; i++) {
    res.push(initial[(startIndex + i) % initial.length])
  }
  return res
}

console.log(getExtended(tabs, 0))