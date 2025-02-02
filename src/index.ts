import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
  FlashbotsBundleTransaction
} from "@flashbots/ethers-provider-bundle";
import { providers, Wallet } from "ethers";
import { TransferERC20 } from "./engine/UnstakeAndTransferERC20";
import { Base } from "./engine/Base";
import { checkSimulation, ETHER, gasPriceToGwei, printTransactions } from "./utils";
// import { CryptoKitties } from "./engine/CryptoKitties";

require('dotenv').config()
require('log-timestamp');

const MINER_REWARD_IN_WEI = ETHER.div(1000).mul(30); // 0.030 ETH
const BLOCKS_IN_FUTURE = 2;

const PRIVATE_KEY_ZERO_GAS = process.env.PRIVATE_KEY_ZERO_GAS || ""
const PRIVATE_KEY_DONOR = process.env.PRIVATE_KEY_DONOR || ""
const RECIPIENT = process.env.RECIPIENT || ""
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "http://127.0.0.1:8545"
const FLASHBOTS_RELAY_SIGNING_KEY = process.env.FLASHBOTS_RELAY_SIGNING_KEY || "";
const DRY_RUN = process.env.DRY_RUN ?? false; // if unspecified, it will run the full suite on mainnet; otherwise it will simply simulate the tx

if (PRIVATE_KEY_ZERO_GAS === "") {
  console.warn("Must provide PRIVATE_KEY_ZERO_GAS environment variable, corresponding to Ethereum EOA with assets to be transferred")
  process.exit(1)
}
if (PRIVATE_KEY_DONOR === "") {
  console.warn("Must provide PRIVATE_KEY_DONOR environment variable, corresponding to an Ethereum EOA with ETH to pay miner")
  process.exit(1)
}
if (FLASHBOTS_RELAY_SIGNING_KEY === "") {
  console.warn("Must provide FLASHBOTS_RELAY_SIGNING_KEY environment variable. Please see https://github.com/flashbots/pm/blob/main/guides/flashbots-alpha.md")
  process.exit(1)
}
if (RECIPIENT === "") {
  console.warn("Must provide RECIPIENT environment variable, an address which will receive assets")
  process.exit(1)
}

const provider = new providers.JsonRpcProvider(ETHEREUM_RPC_URL);
const walletZeroGas = new Wallet(PRIVATE_KEY_ZERO_GAS, provider);
const walletDonor = new Wallet(PRIVATE_KEY_DONOR, provider);
const walletRelay = new Wallet(FLASHBOTS_RELAY_SIGNING_KEY, provider)

console.log(`Zero Gas Account: ${walletZeroGas.address}`)
console.log(`Donor Account: ${walletDonor.address}`)
console.log(`Miner Reward: ${MINER_REWARD_IN_WEI.mul(1000).div(ETHER).toNumber() / 1000}`)
console.log(`Recipient: ${RECIPIENT}`)

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const NONCE = await walletZeroGas.getTransactionCount();
  console.log(`Nonce: ${NONCE}`)
  if (DRY_RUN)
    console.log("STARTING DRY RUN");

  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, walletRelay);

  const tokenAddress = "0xfcfC434ee5BfF924222e084a8876Eee74Ea7cfbA";    // rLP token address
  const stakingAddress = "0xdaFCE5670d3F67da9A3A44FE6bc36992e5E2beaB";  // delta staking contract address
  const wEthAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";     // wETH token address
  const engine: Base = new TransferERC20(provider, walletZeroGas.address, RECIPIENT, tokenAddress, stakingAddress, wEthAddress, NONCE);

  // const kittyIds = [14925,97811];
  // const engine: Base = new CryptoKitties(provider, walletZeroGas.address, RECIPIENT, kittyIds);

  const zeroGasTxs = await engine.getZeroGasPriceTx();
  const donorTx = await engine.getDonorTx(MINER_REWARD_IN_WEI);

  const bundleTransactions: Array<FlashbotsBundleTransaction> = [
    ...zeroGasTxs.map(transaction => {
      return {
        transaction,
        signer: walletZeroGas,
      }
    }),
    {
      transaction: donorTx,
      signer: walletDonor
    }
  ]
  const signedBundle = await flashbotsProvider.signBundle(bundleTransactions)
  await printTransactions(bundleTransactions, signedBundle);
  const gasPrice = await checkSimulation(flashbotsProvider, signedBundle);
  console.log(`Gas Price: ${gasPriceToGwei(gasPrice)} gwei`)
  console.log(await engine.description())

  if (DRY_RUN) {
    console.log(`Dry run ended`);
    process.exit(0);
  } else {
    console.log("Executing script in 5 seconds. Press CTRL-C or Cmd-C to exit now.");
    await sleep(5000);
  }

  // DANGER: ACTUALLY SENDING FUNDS ON MAINNET AFTER THIS POINT
  provider.on('block', async (blockNumber) => {
    const gasPrice = await checkSimulation(flashbotsProvider, signedBundle);
    const targetBlockNumber = blockNumber + BLOCKS_IN_FUTURE;
    console.log(`Current Block Number: ${blockNumber},   Target Block Number:${targetBlockNumber},   gasPrice: ${gasPriceToGwei(gasPrice)} gwei`)
    const bundleResponse = await flashbotsProvider.sendBundle(bundleTransactions, targetBlockNumber);
    const bundleResolution = await bundleResponse.wait()
    if (bundleResolution === FlashbotsBundleResolution.BundleIncluded) {
      console.log(`Congrats, included in ${targetBlockNumber}`)
      process.exit(0)
    } else if (bundleResolution === FlashbotsBundleResolution.BlockPassedWithoutInclusion) {
      console.log(`Not included in ${targetBlockNumber}`)
    } else if (bundleResolution === FlashbotsBundleResolution.AccountNonceTooHigh) {
      console.log("Nonce too high, bailing")
      process.exit(1)
    }
  })
}

main()
