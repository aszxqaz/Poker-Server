import { Speed } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { seedConfig } from './config'

export const seedSngs = async (prismaService: PrismaService) => {
  const { BUYINS, TABLE_SIZES, PRIZES, RAKES, SPEEDS, CHIPS } = seedConfig.sng

  const namingFn = (buyin: number, tableSize: number) => {
    if (tableSize === 2) return `Heads Up $${Math.floor(buyin / 100)}`

    return `${tableSize}-max $${Math.floor(buyin / 100)}`
  }

  const prizesFn = (buyin: number, tableSize: number, speed: string) => {
    const prizePool =
      (buyin - (buyin * RAKES[SPEEDS.indexOf(speed as Speed)]) / 100) * tableSize
    const struct = PRIZES[TABLE_SIZES.indexOf(tableSize)]
    let rest = 0
    const notInt = struct
      .map((s) => s * prizePool)
      .map((s) => {
        rest += s - Math.trunc(s)
        s -= s - Math.trunc(s)
        return s
      })
    notInt[0] += rest
    return notInt
  }

  BUYINS.forEach((buyin) =>
    TABLE_SIZES.forEach((tableSize) =>
      SPEEDS.forEach(async (speed) => {
        await prismaService.tourney.createMany({
          data: [
            {
              buyin,
              name: namingFn(buyin, tableSize),
              speed,
              type: 'SNG',
              tableSize,
              prizes: prizesFn(buyin, tableSize, speed),
              chips: CHIPS[`${speed}:${tableSize}`]
            }
          ]
        })
      })
    )
  )
}
