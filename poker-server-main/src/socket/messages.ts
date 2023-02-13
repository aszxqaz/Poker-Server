export const UserMessages = {
  BALANCE: 'balance'
}

export const CashMessages = {
  JOIN: 'cash.join',
  LEAVE: 'cash.leave',
  ALL: 'cash.all',
  ONE: 'cash.one',
} as const

export const TourneyMessages = {
  FINISH: 'tourney.finish'
}

export const SngMessages = {
  JOIN: 'sng.join',
  UNJOIN: 'sng.unjoin',
  LEAVE: 'sng.leave',
  ALL: 'sng.all',
  ONE: 'sng.one',
  REMATCH: 'sng.rematch',
  PLAY_AGAIN: 'sng.again'
} as const

export const ActiveMessages = {
  ALL: 'active.all',
  ONE: 'active.one'
}

export const TableMessages = {
  ACTION: 'round.action',
}