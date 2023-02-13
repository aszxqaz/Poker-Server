import { Speed } from '@prisma/client'

export const seedConfig = {
  sng: {
    SPEEDS: ['REGULAR', 'TURBO', 'HYPER', 'ULTRA'] as Speed[],
    RAKES: [4, 3, 2, 1],
    BUYINS: [100, 200, 500], //, 1000, 2000, 5000],
    TABLE_SIZES: [2, 3, 6],
    PRIZES: [[1], [1], [0.75, 0.25]],
    CHIPS: {
      'REGULAR:2': 1500,
      'REGULAR:3': 1500,
      'REGULAR:6': 1500,
      'TURBO:2': 1500,
      'TURBO:3': 1500,
      'TURBO:6': 1500,
      'HYPER:2': 800,
      'HYPER:3': 800,
      'HYPER:6': 800,
      'ULTRA:2': 800,
      'ULTRA:3': 800,
      'ULTRA:6': 800
    }
  },

  cash: {
    STACKS: [20, 100],
    BBS: [2, 4, 10, 20], //50, 100, 200, 500, 1000, 2000, 5000],
    TABLE_SIZES: [2, 3, 6] //, 9]
  }
}
