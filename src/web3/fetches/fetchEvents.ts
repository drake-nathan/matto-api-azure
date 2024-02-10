import type { Connection } from "mongoose";
import type { Address } from "viem";

import { z } from "zod";

import type { Chain } from "../../projects";

import { getLastTxProcessed } from "../../db/queries/transactionQueries";
import { oneHundredxAbi } from "../../projects/100x10x1x/abi";
import { zodAddress, zodBigIntToNumber, zodHash } from "../../utils/zod";
import { getViem } from "../providers";

const incomingTxSchema = z.object({
  address: zodAddress,
  args: z.object({
    from: zodAddress.optional(),
    to: zodAddress.optional(),
    tokenId: zodBigIntToNumber.optional(),
  }),
  blockNumber: zodBigIntToNumber,
  eventName: z.string(),
  transactionHash: zodHash,
});
const fetchSchema = z.array(incomingTxSchema);

export type IncomingTx = z.infer<typeof incomingTxSchema>;

export const fetchEvents = async ({
  chain,
  conn,
  contractAddress,
  creationBlock,
  events,
  fetchAll = false,
  projectId,
}: {
  chain: Chain;
  conn: Connection;
  contractAddress: Address;
  creationBlock: number;
  events: string[];
  fetchAll?: boolean;
  projectId: number;
}) => {
  const fromBlock =
    fetchAll ? creationBlock : (
      (await getLastTxProcessed(projectId, conn)) ?? creationBlock
    );

  const viem = getViem(chain);

  const allTransactions = await viem.getContractEvents({
    abi: oneHundredxAbi,
    address: contractAddress,
    fromBlock: BigInt(fromBlock),
  });

  const validatedTransactions = fetchSchema.parse(allTransactions);

  const filteredTransactions = validatedTransactions.filter((tx) => {
    if (projectId === 7) {
      if (tx.eventName === "OrderChanged") {
        const mintTx = allTransactions.find(
          (t) =>
            t.transactionHash.toLowerCase() ===
              tx.transactionHash.toLowerCase() && t.eventName === "Transfer",
        );
        if (mintTx) return false;
      }
    }

    return events.includes(tx.eventName);
  });

  return {
    filteredTransactions,
    totalTxCount: allTransactions.length,
  };
};

// const callFetchEvents = async () => {
//   const conn = await connectionFactory();

//   const transactions = await fetchEvents({
//     chain: "goerli",
//     conn,
//     contractAddress: "0x6aBf38A6cB1f0ab87047E80Efd1B109C8E5CeFF3",
//     creationBlock: 10129683,
//     events: ["Transfer", "OrderChanged"],
//     fetchAll: true,
//     projectId: 7,
//   });

//   console.log(transactions.filteredTransactions[45]);
// };

// void callFetchEvents();
