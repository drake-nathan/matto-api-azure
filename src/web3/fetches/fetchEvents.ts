import type { Connection } from "mongoose";
import type { Contract } from "web3-eth-contract";

import { z } from "zod";

import { connectionFactory } from "../../db/connectionFactory";
import { getLastTxProcessed } from "../../db/queries/transactionQueries";
import { abis } from "../../projects";
import { getContractWeb3 } from "../contractWeb3";
import { getWeb3 } from "../providers";

const incomingTxSchema = z.object({
  address: z.string(),
  blockNumber: z.number(),
  event: z.string(),
  returnValues: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    tokenId: z.string().optional(),
  }),
  transactionHash: z.string(),
});
const fetchSchema = z.array(incomingTxSchema);

type IncomingTx = z.infer<typeof incomingTxSchema>;

export const fetchEvents = async ({
  conn,
  contract,
  creationBlock,
  events,
  fetchAll = false,
  projectId,
}: {
  conn: Connection;
  contract: Contract;
  creationBlock: number;
  events: string[];
  fetchAll?: boolean;
  projectId: number;
}): Promise<{
  filteredTransactions: IncomingTx[];
  totalTxCount: number;
}> => {
  const fromBlock =
    fetchAll ? creationBlock : (
      (await getLastTxProcessed(projectId, conn)) ?? creationBlock
    );
  const options = { fromBlock };

  const allTransactions = await contract.getPastEvents("allEvents", options);

  const validatedTransactions = fetchSchema.parse(allTransactions);

  const filteredTransactions = validatedTransactions.filter((tx) => {
    if (projectId === 7) {
      if (tx.event === "OrderChanged") {
        const mintTx = allTransactions.find(
          (t) =>
            t.transactionHash.toLowerCase() ===
              tx.transactionHash.toLowerCase() && t.event === "Transfer",
        );
        if (mintTx) return false;
      }
    }

    return events.includes(tx.event);
  });

  return {
    filteredTransactions,
    totalTxCount: allTransactions.length,
  };
};

const callFetchEvents = async () => {
  const web3 = getWeb3("goerli");
  const contract = getContractWeb3(
    web3,
    abis[7],
    "0x6aBf38A6cB1f0ab87047E80Efd1B109C8E5CeFF3",
  );

  const conn = await connectionFactory();

  const transactions = await fetchEvents({
    conn,
    contract,
    creationBlock: 10129683,
    events: ["Transfer", "OrderChanged"],
    fetchAll: true,
    projectId: 7,
  });

  console.log(transactions.filteredTransactions[0]);
};

void callFetchEvents();
