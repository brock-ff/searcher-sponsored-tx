import { BigNumber, Contract, providers } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { Base } from "./Base";

const ERC20_ABI = [{"constant":true,"inputs":[],"name":"mintingFinished","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MAXIMUM_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"unpause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"paused","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_subtractedValue","type":"uint256"}],"name":"decreaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finishMinting","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"pause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_token","type":"address"},{"name":"_to","type":"address"}],"name":"salvageTokens","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_addedValue","type":"uint256"}],"name":"increaseApproval","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DipTokensale","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[],"name":"MintFinished","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}];
const STAKING_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"CLAIMING_PERIOD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DELTA_FINANCIAL_MULTISIG","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INTERIM_ADMIN","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LSW_RUN_TIME","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_ETH_POOL_SEED","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_TIME_BONUS_PERCENT","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"adminEndLSWAndRefundEveryone","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"person","type":"address"}],"name":"allLiquidityContributionsOfAnAddress","outputs":[{"components":[{"internalType":"address","name":"byWho","type":"address"},{"internalType":"uint256","name":"howMuchETHUnits","type":"uint256"},{"internalType":"uint256","name":"contributionTimestamp","type":"uint256"},{"internalType":"uint256","name":"creditsAdded","type":"uint256"}],"internalType":"struct DELTA_Limited_Staking_Window.LiquidityContribution[]","name":"liquidityContributionsOfPerson","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"claimToWalletInstead","type":"bool"}],"name":"claimOrStakeAndClaimLP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimedLP","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"readAndAgreedToLiquidityProviderAgreement","type":"bool"},{"internalType":"address","name":"referrerAddress","type":"address"},{"internalType":"uint256","name":"referralID","type":"uint256"}],"name":"contributeLiquidity","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"deltaDeepFarmingVaultAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deltaTokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endLiquidityDeployment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"numberSeconds","type":"uint256"}],"name":"extendLSWEndTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"finalizeLSW","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getRefund","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getWETHBonusForReferrals","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"liquidityContributedInETHUnitsMapping","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"liquidityContributionsArray","outputs":[{"internalType":"address","name":"byWho","type":"address"},{"internalType":"uint256","name":"howMuchETHUnits","type":"uint256"},{"internalType":"uint256","name":"contributionTimestamp","type":"uint256"},{"internalType":"uint256","name":"creditsAdded","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"liquidityCreditsMapping","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityGenerationEndTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityGenerationHasEnded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityGenerationHasStarted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"liquidityGenerationParticipationAgreement","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"liquidityGenerationStartTimestamp","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"makeRefCode","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"onlyInterimAdmin","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[],"name":"onlyMultisig","outputs":[],"stateMutability":"view","type":"function"},{"inputs":[],"name":"openRefunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rebasingLP","outputs":[{"internalType":"contract IRLP","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralBonusWETH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralBonusWETHClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referralCodeMappingIndexedByAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"referralCodeMappingIndexedByID","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"refundClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"refundsOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"reserveVaultAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"rlpPerCredit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"secondsLeftInLiquidityGenerationEvent","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"deltaToken","type":"address"},{"internalType":"bool","name":"delegateCall","type":"bool"}],"name":"setDELTAToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"farmingVault","type":"address"}],"name":"setFarmingVaultAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"multisig","type":"address"}],"name":"setMultisig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"rlpAddress","type":"address"}],"name":"setRLPWrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"reserveVault","type":"address"}],"name":"setReserveVault","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startLiquidityGeneration","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalCreditValue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalReferralIDs","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalWETHEarmarkedForReferrers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"wETH","outputs":[{"internalType":"contract IWETH","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"stateMutability":"payable","type":"receive"}]

export class TransferERC20 extends Base {
  private _provider: providers.JsonRpcProvider;
  private _sender: string;
  private _recipient: string;
  private _tokenContract: Contract;
  private _stakingContract: Contract;
  private _wEthContract: Contract;
  private _nonce: number; // starting nonce of compromised account

  constructor(provider: providers.JsonRpcProvider, sender: string, recipient: string, _tokenAddress: string, _stakingAddress: string, _wEthAddress: string, _nonce: number) {
    super()
    if (!isAddress(sender)) throw new Error("Bad Address")
    if (!isAddress(recipient)) throw new Error("Bad Address")
    this._sender = sender;
    this._provider = provider;
    this._recipient = recipient;
    this._tokenContract = new Contract(_tokenAddress, ERC20_ABI, provider);
    this._stakingContract = new Contract(_stakingAddress, STAKING_ABI, provider);
    this._wEthContract = new Contract(_wEthAddress, ERC20_ABI, provider);
    this._nonce = _nonce;
  }

  async description(): Promise<string> {
    return `
    Claim rLP from Delta contract (${this._stakingContract.address})\n
    Claim wETH from Delta contract (${this._stakingContract.address})\n
    Transfer rLP balance from ${this._sender} to ${this._recipient}\n
    Transfer wETH balance from ${this._sender} to ${this._recipient}
    `;
  }

  async getZeroGasPriceTx(): Promise<Array<TransactionRequest>> {
    const tokenBalance = await this.getTokenBalance();
    const wethBalance = await this.getWethBalance();
    return [
      { // withdraw rLP from Delta staking contract
        ...(await this._stakingContract.populateTransaction.claimOrStakeAndClaimLP(true)),
        gasPrice: BigNumber.from(0),
        gasLimit: BigNumber.from(240000), 
        nonce: this._nonce,
      },
      { // withdraw wETH from Delta staking contract (referral bonus)
        ...(await this._stakingContract.populateTransaction.getWETHBonusForReferrals()),
        gasPrice: BigNumber.from(0),
        gasLimit: BigNumber.from(240000), 
        nonce: this._nonce === undefined ? undefined : this._nonce + 1,
      },
      { // transfer wETH to safe account
        ...(await this._wEthContract.populateTransaction.transfer(this._recipient, wethBalance)),
        gasPrice: BigNumber.from(0),
        gasLimit: BigNumber.from(120000),
        nonce: this._nonce === undefined ? undefined : this._nonce + 2,
      },
      { // transfer rLP to safe account
        ...(await this._tokenContract.populateTransaction.transfer(this._recipient, tokenBalance)),
        gasPrice: BigNumber.from(0),
        gasLimit: BigNumber.from(120000),
        nonce: this._nonce === undefined ? undefined : this._nonce + 3,
      }
    ]
  }

  private getTokenBalance(): BigNumber {
    // rLP tokens: 24.565 * 10^18
    return BigNumber.from("24564551000000000000");   // rLP amount
  }

  private getWethBalance(): BigNumber {
    // wETH referral bonus: 0.758 * 10^18
    return BigNumber.from("758000000000000000");
  }

  async getDonorTx(minerReward: BigNumber): Promise<TransactionRequest> {
    const checkTargets = [
      this._tokenContract.address, 
      this._wEthContract.address
    ];
    const checkPayloads = [
      this._tokenContract.interface.encodeFunctionData('balanceOf', [this._recipient]),
      this._wEthContract.interface.encodeFunctionData('balanceOf', [this._recipient]),
    ];
    // recipient will not have a token balance, so we can assume that the balance should simply equal the value we transfer
    const expectedBalanceRLP = this.getTokenBalance();
    const expectedBalanceWETH = this.getWethBalance();
    const checkMatches = [
      this._tokenContract.interface.encodeFunctionResult('balanceOf', [expectedBalanceRLP]),
      this._wEthContract.interface.encodeFunctionResult('balanceOf', [expectedBalanceWETH]),
    ];
    return {
      ...(await Base.checkAndSendContract.populateTransaction.check32BytesAndSendMulti(checkTargets, checkPayloads, checkMatches)),
      value: minerReward,
      gasPrice: BigNumber.from(0),
      gasLimit: BigNumber.from(400000),
    }
  }
}
