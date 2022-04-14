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

  // delay to make sure the provider is fully connected
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const storageAdapter = new LocalStorageAdapterMock();
  const env = {
    contracts: [exchangeArtifact, protocolDeployments, tokenDeployments],
  }

  const sdk = new SDK({
    customFetch,
    env,
    provider,
    storageAdapter
  });
  
  await sdk.awaitInitialized();

  const TOKEN_LISTS = [
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/defi.tokenlist.json',
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/elastic.tokenlist.json',
    'https://raw.githubusercontent.com/ElasticSwap/tokenlists/master/stablecoin.tokenlist.json',
  ];

  await Promise.all(TOKEN_LISTS.map((url) => sdk.tokenList(url)));

  const exchange = await sdk.exchangeFactory.exchange(BASE_TOKEN, QUOTE_TOKEN);
  const baseTokenQtyToSwap = 10.5;
  const expectedOutput = await exchange.getQuoteTokenQtyFromBaseTokenQty(baseTokenQtyToSwap);
  console.log(
    `Swapping ${baseTokenQtyToSwap} ${exchange.baseToken.symbol} for ${expectedOutput.toString()} ${exchange.quoteToken.symbol}`
  );

  const reverseOutput = await exchange.getBaseTokenQtyFromQuoteTokenQty(expectedOutput);
  console.log(
    `Swapping ${expectedOutput.toString()} ${exchange.quoteToken.symbol} for ${reverseOutput.toString()} ${exchange.baseToken.symbol}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });