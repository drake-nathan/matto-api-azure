import { AbiItem } from 'web3-utils';
import web3 from './provider';

export const getContract = (abi: AbiItem[], address: string) =>
  new web3.eth.Contract(abi, address);
