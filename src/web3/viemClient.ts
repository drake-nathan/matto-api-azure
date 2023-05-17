import { createPublicClient, http } from 'viem';
import { mainnet, goerli } from 'viem/chains';
import { Chain } from '../projects';

export const getViemClient = (chain: Chain) => {
  const nodes = {
    [Chain.mainnet]: process.env.RPC_NODE_MAINNET as string,
    [Chain.goerli]: process.env.RPC_NODE_GOERLI as string,
  };

  const chainDefinitions = {
    [Chain.mainnet]: mainnet,
    [Chain.goerli]: goerli,
  };

  const client = createPublicClient({
    chain: chainDefinitions[chain],
    transport: http(nodes[chain]),
  });

  return client;
};
