import { type Address, getContract } from "viem";

import type { Chain } from "../..";

import { getViem } from "../../../web3/providers";
import { oneHundredxAbi } from "../abi";

export const getTokenZeroDescription = async (
  chain: Chain,
  contractAddress: Address,
  collectionDescription: string,
) => {
  const viemClient = getViem(chain);

  const contract = getContract({
    abi: oneHundredxAbi,
    address: contractAddress,
    publicClient: viemClient,
  });

  const compositeOrderUnformatted = await contract.read.getOrder();
  // add space between commas
  const compositeOrder = compositeOrderUnformatted.replace(/,/g, ", ");

  const extraDescription =
    "Token 0 represents the composite artwork. It is owned by the smart-contract, and it can be leant out (and recalled back), by the artist at any time.";

  const finalDescription = `${collectionDescription} ${extraDescription}\n\nComposite Order: ${compositeOrder}`;

  return finalDescription;
};
