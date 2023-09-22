import type Web3 from "web3";
import { AbiItem } from "web3-utils";

export const getContractWeb3 = (web3: Web3, abi: AbiItem[], address: string) =>
  new web3.eth.Contract(abi, address);
