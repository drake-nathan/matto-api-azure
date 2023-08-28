import { getContract } from "viem";

import { getViem } from "../../../web3/providers";
import { Chain } from "../..";
import { oneHundredxAbi } from "../abi";

export const getTokenZeroDescription = async (
  chain: Chain,
  contractAddress: string,
  collectionDescription: string,
) => {
  const viemClient = getViem(chain);

  const contract = getContract({
    address: contractAddress as `0x${string}`,
    abi: oneHundredxAbi,
    publicClient: viemClient,
  });

  const compositeOrder = await contract.read.getOrder();

  const finalDescription = `${collectionDescription}\n\nComposite Order: ${compositeOrder}`;

  return finalDescription;
};
