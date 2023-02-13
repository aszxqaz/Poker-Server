import { ethers, Wallet } from "ethers";
import { writeFileSync } from 'fs'
import { readFile } from "fs/promises";

async function main() {
  const encJson = (await readFile(process.cwd() + '/wallet.json', 'utf-8'))
  let wallet = await Wallet.fromEncryptedJson(encJson, '123456')
  const provider = ethers.getDefaultProvider(ethers.providers.getNetwork('goerli'))
  wallet = wallet.connect(provider)
  const balance = (await wallet.getBalance()).toNumber()
  console.log(`Balance: ${ethers.utils.formatEther(balance)}`)
  console.log(wallet.address)
}

main()