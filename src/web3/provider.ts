import Web3 from 'web3';
import * as dotenv from 'dotenv';
import { Chain } from '../projects';

dotenv.config();

export const getWeb3 = (chain: Chain): Web3 => {
  const nodes = {
    [Chain.mainnet]: process.env.RPC_NODE_MAINNET as string,
    [Chain.goerli]: process.env.RPC_NODE_GOERLI as string,
  };

  const web3Provider = new Web3.providers.HttpProvider(nodes[chain]);

  const web3 = new Web3(web3Provider);

  return web3;
};
