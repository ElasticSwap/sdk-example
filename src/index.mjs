import customFetch from 'node-fetch';
import { SDK } from '@elasticswap/sdk';
import { ethers } from 'ethers';

import protocolDeployments from '@elasticswap/elasticswap/artifacts/deployments.json' assert { type: 'json'};
import tokenDeployments from '@elasticswap/token/artifacts/deployments.json' assert { type: 'json'};
import exchangeArtifact from '@elasticswap/elasticswap/artifacts/src/contracts/Exchange.sol/Exchange.json' assert { type: 'json'};
import LocalStorageAdapterMock from './LocalStorageAdapterMock.mjs';

const RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';
const BASE_TOKEN = "0x027dbcA046ca156De9622cD1e2D907d375e53aa7"  // AAMPL
const QUOTE_TOKEN = "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" // USDC.e

async function main () {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const storageAdapter = new LocalStorageAdapterMock();
  const chainId = '43114';
  const chainHex = '0xa86a';

  // delay to make sure the provider is fully connected
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const env = {
    networkId: chainId,
    contracts: [exchangeArtifact, protocolDeployments, tokenDeployments],
  }

  const sdk = new SDK({
    customFetch,
    env,
    provider,
    storageAdapter
  });
  
  await sdk.awaitInitialized();

  const LISTS = [
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/defi.tokenlist.json',
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/elastic.tokenlist.json',
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/stablecoin.tokenlist.json',
  ];

  await Promise.all(LISTS.map((url) => sdk.tokenList(url)));

  const exchange = await sdk.exchangeFactory.exchange(BASE_TOKEN, QUOTE_TOKEN);
  // const baseTokenQtyToSwap = ethers.utils.parseUnits("10", 9) // 10 AMPL (w/ 9 decimals)
  // const expectedOutput = await exchange.calculateQuoteTokenQty(baseTokenQtyToSwap, 1);
  // console.log(exchange.address);
  // const internalBal = await exchange.internalBalances();
  // console.log(
  //   internalBal.baseTokenReserveQty.toString(), 
  //   internalBal.quoteTokenReserveQty.toString(), 
  //   expectedOutput.toString()
  // ); 

  // const ethersExchange = new ethers.Contract(exchange.address, exchangeArtifacts.abi, provider);
  // const rawInternalBalances = await ethersExchange.internalBalances();
  // console.log(rawInternalBalances[0].toString(), rawInternalBalances[1].toString());

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });