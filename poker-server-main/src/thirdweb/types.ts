export type EtherscanTransactionsResponse = {
  status: '0' | '1'
  message: 'OK' | 'UNKNOWN'
  result: EtherscanTransaction[]
}

export type EtherscanTransaction = {
  timeStamp: number
  hash: string
  from: string
  to: string
  value: number
} & {
  valueInEther: number
}

export type EtherPrice = {
  ethBtc: number
  ethUsd: number
}