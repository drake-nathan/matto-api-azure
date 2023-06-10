import Web3 from 'web3';
import * as dotenv from 'dotenv';
import { createPublicClient, http } from 'viem';
import { mainnet, goerli } from 'viem/chains';
import { Chain } from '../projects';

dotenv.config();

const mainnetNode = process.env.RPC_NODE_MAINNET;
const goerliNode = process.env.RPC_NODE_GOERLI;

if (!mainnetNode || !goerliNode) {
  throw new Error('RPC_NODE_MAINNET or RPC_NODE_GOERLI not found in .env');
}

const nodes = {
  [Chain.mainnet]: mainnetNode,
  [Chain.goerli]: goerliNode,
};

export const getWeb3 = (chain: Chain): Web3 => {
  const web3Provider = new Web3.providers.HttpProvider(nodes[chain]);

  const web3 = new Web3(web3Provider);

  return web3;
};

export const getViem = (chain: Chain) => {
  const chains = {
    [Chain.mainnet]: mainnet,
    [Chain.goerli]: goerli,
  };

  const client = createPublicClient({
    chain: chains[chain],
    transport: http(nodes[chain]),
  });

  return client;
};