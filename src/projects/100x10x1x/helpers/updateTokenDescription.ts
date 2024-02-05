import type { Connection } from "mongoose";

import { getContract, isAddress } from "viem";

import type { Chain, ProjectId } from "../..";
import type { OneHundredXTokenData } from "./zod";

import { updateOneTokenDescription } from "../../../db/queries/tokenQueries";
import { getViem } from "../../../web3/providers";
import { oneHundredxAbi } from "../abi";
import { oneHundredXTokenDataSchema } from "./zod";

export const updateTokenDescription = async ({
  chain,
  conn,
  contractAddress,
  projectId,
  tokenId,
}: {
  chain: Chain;
  conn: Connection;
  contractAddress: string;
  projectId: ProjectId;
  tokenId: number;
}) => {
  if (!isAddress(contractAddress)) {
    throw new Error("Invalid contract address");
  }

  const viem = getViem(chain);

  const contract = getContract({
    abi: oneHundredxAbi,
    address: contractAddress,
    client: { public: viem },
  });

  let tokenDataJson: string;
  try {
    tokenDataJson = await contract.read.tokenDataOf([BigInt(tokenId)]);
  } catch (error) {
    throw new Error("Error fetching `tokenDataOf`", { cause: error });
  }

  let tokenData: OneHundredXTokenData;
  try {
    const tokenDataOf = JSON.parse(tokenDataJson);

    tokenData = oneHundredXTokenDataSchema.parse(tokenDataOf);
  } catch (error) {
    throw new Error("Error parsing `tokenDataOf`", { cause: error });
  }

  await updateOneTokenDescription(
    conn,
    projectId,
    tokenId,
    tokenData.description,
  );
};
