import { ConfigService } from '@nestjs/config'
import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { Injectable } from '@nestjs/common'
import { BigNumber, ethers, getDefaultProvider, providers, utils, Wallet } from 'ethers'
import { EtherPrice, EtherscanTransactionsResponse } from './types'

@Injectable()
export class ThirdwebService {
  private sdk: ThirdwebSDK
  private NETWORK: string
  private WALLET_ENCRYPTION_PASSOWRD: string
  private PROVIDER: providers.BaseProvider
  private IS_DEV: boolean

  constructor(private readonly configService: ConfigService) {
    this.IS_DEV = this.configService.get('NODE_ENV') !== 'production'

    this.NETWORK = this.IS_DEV
      ? this.configService.get('ETHEREUM_NETWORK_DEV')
      : this.configService.get('ETHEREUM_NETWORK_PROD')

    this.WALLET_ENCRYPTION_PASSOWRD = this.configService.get('WALLET_ENCRYPTION_PASSWORD')

    // this.PROVIDER = getDefaultProvider(providers.getNetwork(this.NETWORK), {
    //   etherscan: this.configService.get('ETHERSCAN_API_KEY'),
    // })

    this.PROVIDER = new providers.EtherscanProvider(
      providers.getNetwork(this.NETWORK),
      this.configService.get('ETHERSCAN_API_KEY'),
    )

    // this.sdk = ThirdwebSDK.fromPrivateKey(this.configService.get('WALLET_PRIVATE_KEY'), net)
  }

  // public async transferTo(to: string, amount: number) {
  //   return this.sdk.wallet.transfer(to, amount)
  // }

  // public abc() {
  //   const wallet = Wallet.createRandom()
  // }

  public async generateWallet() {
    let wallet = Wallet.createRandom().connect(this.PROVIDER)
    const encJson = await wallet.encrypt(this.WALLET_ENCRYPTION_PASSOWRD)
    const address = wallet.address

    return {
      address,
      encJson,
    }
  }

  public async transferToRoomWallet(walletJson: string, amount: string) {
    const INTERNAL_WALLET = this.configService.get('INTERNAL_ROOM_WALLET_ADDRESS')

    const wallet = await this.getWalletFromJson(walletJson)

    // const gas = await provider.estimateGas({
    //   from: wallet.address,
    //   to: internal,
    //   value: balance,
    // })

    const balance = await wallet.getBalance()
    const { baseFeePerGas, gasUsed, transactions, gasLimit } =
      await this.PROVIDER.getBlock('latest')

    const { maxPriorityFeePerGas, lastBaseFeePerGas, gasPrice, maxFeePerGas } =
      await this.PROVIDER.getFeeData()
    // const gasPrice = await this.PROVIDER.getGasPrice()
    // const gasLimit = gasLimitTotal.div(BigNumber.from(transactions.length))

    // const transactionFee = (lastBaseFeePerGas
    //   .add(maxPriorityFeePerGas))
    // //   .mul(gasLimit.div(BigNumber.from(transactions.length)))

    // const transactionFee = lastBaseFeePerGas
    //   .add(maxPriorityFeePerGas)
    //   .mul(ethers.utils.parseEther('0.0005').div(gasPrice))
    //   // .div(BigNumber.from(transactions.length))

    // const _amount = gasPrice
    // .mul(balance)
    // .div((lastBaseFeePerGas.add(maxPriorityFeePerGas).mul(BigNumber.from(1).add(gasPrice))))

    // console.log(ethers.utils.formatEther(balance))
    // console.log(ethers.utils.formatEther(_amount))
    // console.log(ethers.utils.formatEther(transactionFee))

    // console.log(ethers.utils.formatEther(value))

    const estimated = (
      await this.PROVIDER.estimateGas({
        to: INTERNAL_WALLET,
        // value: balance.div(BigNumber.from(2)),
        value: balance,
        from: wallet.address,
      })
    ).mul(await wallet.getGasPrice())

    const value = balance.sub(estimated).sub(estimated)
    // .sub(estimated.div(BigNumber.from(2)))

    while (true) {
      try {
        await wallet.sendTransaction({
          to: INTERNAL_WALLET,
          value: value,
          from: wallet.address,
        })
        break
      } catch (e) {}
    }
  }

  public async getPaymentsToWallet(address: string) {
    const res = await fetch(this.getTransactionsAPIEndpoint(address))
    const { status, message, result } =
      (await res.json()) as EtherscanTransactionsResponse

    if (!result?.length) return null
    // TODO

    let deposit = 0

    return result
      .filter((transaction) => transaction.to === address.toLowerCase())
      .map((transaction) => ({
        ...transaction,
        valueInEther: parseFloat(utils.formatEther(BigNumber.from(transaction.value))),
      }))
  }

  private getWalletFromJson(json: string) {
    return Wallet.fromEncryptedJson(json, this.WALLET_ENCRYPTION_PASSOWRD).then(
      (wallet) => wallet.connect(this.PROVIDER),
    )
  }

  private getTransactionsAPIEndpoint(address: string) {
    switch (this.NETWORK) {
      case 'goerli': {
        return `https://api-goerli.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${this.configService.get(
          'ETHERSCAN_API_KEY',
        )}`
      }
      default: {
        throw new Error('Can not get transactions API endpoint')
      }
    }
  }

  public async getEtherPrice(): Promise<EtherPrice> {
    let BASE_URL = ''
    switch (this.NETWORK) {
      case 'goerli': {
        BASE_URL = 'https://api-goerli.etherscan.io'
        break
      }
      case 'mainnet': {
        BASE_URL = 'https://api.etherscan.io'
        break
      }
      default: {
        throw new Error('Can not get ether price')
      }
    }

    const { result } = await fetch(
      `${BASE_URL}/api?module=stats&action=ethprice&apikey=${this.configService.get(
        'ETHERSCAN_API_KEY',
      )}`,
    ).then((res) => res.json())

    return {
      ethBtc: parseFloat(result.ethbtc),
      ethUsd: parseFloat(result.ethusd),
    }
  }
}
