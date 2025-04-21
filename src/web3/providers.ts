import * as dotenv from "dotenv";
import { createPublicClient, http, type PublicClient } from "viem";
import { goerli, mainnet } from "viem/chains";
import Web3 from "web3";

import type { Chain } from "../projects";

// Import the counter function
import { incrementRpcCount } from "../utils/rpcCounter";

dotenv.config();

const mainnetNode = process.env.RPC_NODE_MAINNET;

if (!mainnetNode) {
  throw new Error("RPC_NODE_MAINNET not found in .env");
}

const nodes: Record<Chain, string> = {
  goerli: mainnetNode,
  mainnet: mainnetNode,
};

// Update getWeb3 to accept functionName & use arrow function
export const getWeb3: (chain: Chain, functionName?: string) => Web3 = (
  chain,
  functionName = "",
) => {
  // Create the original provider
  const originalProvider = new Web3.providers.HttpProvider(nodes[chain]);

  const proxiedProvider = new Proxy(originalProvider, {
    get: (target, prop, receiver) => {
      const originalValue = Reflect.get(target, prop, receiver);
      if (prop === "send" && typeof originalValue === "function") {
        return (...args: unknown[]) => {
          incrementRpcCount(functionName);
          return originalValue.apply(target, args);
        };
      }
      return originalValue;
    },
  });

  const web3 = new Web3(proxiedProvider);

  return web3;
};

// Update getViem to accept functionName & use arrow function
// Set correct return type PublicClient
export const getViem: (chain: Chain, functionName?: string) => PublicClient = (
  chain,
  functionName = "",
) => {
  const chains = { goerli, mainnet };

  // Create the original client
  const originalClient = createPublicClient({
    chain: chains[chain],
    transport: http(nodes[chain]),
  });

  const proxiedClient = new Proxy(originalClient, {
    get: (target, prop, receiver) => {
      const originalValue = Reflect.get(target, prop, receiver);
      if (typeof originalValue === "function") {
        return (...args: unknown[]) => {
          incrementRpcCount(functionName);
          return originalValue.apply(target, args);
        };
      }
      return originalValue;
    },
  });

  return proxiedClient;
};
