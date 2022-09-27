import Web3 from 'web3';
import * as dotenv from 'dotenv';

dotenv.config();

const nodes = {
  mainnet: process.env.RPC_NODE_MAINNET as string,
  rinkeby: process.env.RPC_NODE_RINKEBY as string,
  goerli: process.env.RPC_NODE_GOERLI as string,
};

const web3Provider = new Web3.providers.HttpProvider(nodes.goerli);

const web3 = new Web3(web3Provider);

export default web3;
