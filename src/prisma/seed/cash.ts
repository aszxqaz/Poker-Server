import { faker } from '@faker-js/faker'
import { Prisma } from '@prisma/client'
import { CASH_TURN_TIMEOUT } from 'src/constants'
import { Round } from 'src/round/round'
import { PrismaService } from '../prisma.service'
import { seedConfig } from './config'

export const seedCash = async (prismaService: PrismaService) => {
  const { BBS, TABLE_SIZES, STACKS } = seedConfig.cash
  const numbers = [
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
    'XIII'
  ]
  const names = []

  STACKS.forEach((stack) =>
    TABLE_SIZES.forEach((tableSize) => {
      let prefix: string
      do {
        prefix = faker.address.streetName()
      } while (names.includes(prefix))
      names.push(prefix)

      return BBS.forEach(async (bb, i) => {
        const table = await prismaService.cashTable.create({
          data: {
            table: {
              create: {
                type: 'CASH',
                name: `${prefix} ${numbers[i]}`,
                tableSize
              }
            },
            bb,
            tableSize,
            name: `${prefix} ${numbers[i]}`,
            stack
          }
        })
        await prismaService.table.update({
          where: { id: table.tableId },
          data: {
            current: new Round({
              bb: table.bb,
              tableId: table.tableId,
              turnTimeout: CASH_TURN_TIMEOUT
            }) as unknown as Prisma.JsonValue
          }
        })
      })
    })
  )
}
