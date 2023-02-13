type R = Record<string | number | symbol, any>

export type BoolFieldArr<T extends R> = Array<
  {
    [K in keyof T]: T[K] extends boolean ? K : never
  }[keyof T]
>

export function getIndexWithExclude<T extends Array<R>>(startIndex: number, excludeFlags: BoolFieldArr<T[number]>, arr: T) {
  if(typeof startIndex !== 'number') throw new Error('Error')
  let i = startIndex = startIndex >= arr.length ? 0 : startIndex
  do {
    console.log('asda')
    let shouldBeExcluded = false
    for (const flag of excludeFlags) {
      if (arr[i][flag]) {
        shouldBeExcluded = true
        break
      }
    }
    if (!shouldBeExcluded) return i
    if (++i === arr.length) i = 0
  } while (i !== startIndex)
  return null
}