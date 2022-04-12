import customFetch from 'node-fetch';
import { SDK } from '@elasticswap/sdk';
import { ethers } from 'ethers';
import deploymentsArtifacts from '@elasticswap/elasticswap/artifacts/deployments.json' assert { type: 'json'};
import LocalStorageAdapterMock from './LocalStorageAdapterMock.mjs';

const RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';
const BASE_TOKEN = "0x027dbcA046ca156De9622cD1e2D907d375e53aa7"  // AAMPL
const QUOTE_TOKEN = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" // USDC.e

async function main () {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const storageAdapter = new LocalStorageAdapterMock();
  const chainId = '43114';
  const chainHex = '0xa86a';
  const contracts = {};
  const deployments = {};

  contracts[chainHex] = deploymentsArtifacts[chainId][0].contracts;
  deployments[chainId] = [{
     chainId,
     contracts: contracts[chainHex],
     name: 'avalanche',
  }];

  const env = {
    networkId: chainId,
    contracts,
    deployments,
  }

  const sdk = new SDK({
    customFetch,
    env,
    provider,
    storageAdapter
  });
  await sdk.awaitInitialized();
  const exchange = await sdk.exchangeFactory.exchange(BASE_TOKEN, QUOTE_TOKEN);
  const baseTokenQtyToSwap = ethers.utils.parseUnits("10", 9) // 10 AMPL (w/ 9 decimals)
  console.log(await exchange.TOTAL_LIQUIDITY_FEE()) // broken here....not sure why
  //const expectedOutput = await exchange.calculateQuoteTokenQty(baseTokenQtyToSwap, 1);
  // console.log(expectedOutput.toString()); 
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });