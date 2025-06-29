import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Address, GetContractEventsReturnType } from "viem";

import { getLastTxProcessed } from "../../db/queries/transactionQueries"; // External first
import { filterRelevantTransactions } from "../../helpers/transactionHelpers/filterRelevantTransactions";
import { abis, type Chain, type ProjectId } from "../../projects";
import { getViem } from "../providers"; // Local providers

// Define IncomingTx type based on Viem's log structure
export interface IncomingTx {
  args: {
    [key: string]: any;
    from?: Address;
    to?: Address;
    tokenId?: number;
  };
  blockNumber: number;
  eventName: string;
  transactionHash: string;
}

interface FetchEventsParams {
  chain: Chain;
  conn: Connection;
  context: Context;
  contractAddress: Address;
  creationBlock: number;
  events: string[];
  fetchAll?: boolean;
  functionName?: string;
  projectId: number;
}

// Define chunk size as number for Web3.js path
const CHUNK_SIZE = 10000n;

export const fetchEvents = async ({
  chain,
  conn,
  context,
  contractAddress,
  creationBlock,
  events,
  fetchAll = false,
  functionName,
  projectId,
}: FetchEventsParams) => {
  // Define return type structure with correct order
  const result: {
    err?: string;
    filteredTransactions: IncomingTx[];
    totalTxCount: number;
  } = {
    filteredTransactions: [],
    totalTxCount: 0,
  };

  try {
    const lastProcessed = await getLastTxProcessed(projectId, conn);
    const fromBlock = BigInt(
      fetchAll ? creationBlock : (lastProcessed ?? creationBlock) + 1,
    );

    const viem = getViem(chain, functionName);
    const latestBlock = await viem.getBlockNumber();

    context.log.info(
      `[fetchEvents - ${contractAddress}] Fetching events from block ${fromBlock} to ${latestBlock} using Viem`,
    );

    let currentStartBlock = fromBlock;
    const finalEndBlock = latestBlock;
    let allTransactions: GetContractEventsReturnType = [];

    while (currentStartBlock <= finalEndBlock) {
      let currentEndBlock = currentStartBlock + CHUNK_SIZE - 1n;
      if (currentEndBlock > finalEndBlock) {
        currentEndBlock = finalEndBlock;
      }

      context.log.info(
        `[fetchEvents - ${contractAddress}] Processing Viem chunk: ${currentStartBlock} - ${currentEndBlock}`,
      );

      try {
        const allTransactionsChunk = await viem.getContractEvents({
          abi: abis[projectId as ProjectId],
          address: contractAddress,
          fromBlock: currentStartBlock,
          toBlock: currentEndBlock,
        });
        allTransactions = allTransactions.concat(allTransactionsChunk);
      } catch (error: unknown) {
        context.log.error(
          `[fetchEvents - ${contractAddress}] Error fetching Viem chunk ${currentStartBlock}-${currentEndBlock}:`,
          error instanceof Error ? error.message : error,
        );
        result.err = `Error fetching Viem events in chunk ${currentStartBlock}-${currentEndBlock}`;
        return result;
      }

      currentStartBlock += CHUNK_SIZE;
    }

    context.log.info(
      `[fetchEvents - ${contractAddress}] Total Viem events fetched: ${allTransactions.length}`,
    );

    const filteredTransactions = filterRelevantTransactions(
      allTransactions,
      events,
    );

    // Transform filtered Viem logs to IncomingTx format
    const transformedFilteredTransactions: IncomingTx[] =
      filteredTransactions.map((log) => ({
        args: (log as any).args || {},
        blockNumber: Number(log.blockNumber),
        eventName: (log as any).eventName || "Unknown",
        transactionHash: log.transactionHash,
      }));

    result.filteredTransactions = transformedFilteredTransactions;

    // TODO: Implement logic to update the last processed block in the DB if conn exists
    context.log.info(
      `[fetchEvents - ${contractAddress}] TODO: Update last processed block to ${finalEndBlock.toString()}`,
    );

    // Get total count after processing
    result.totalTxCount = await conn.models.Transaction.countDocuments({
      projectId,
    });

    return result;
  } catch (err: unknown) {
    const error = err as Error;
    context.log.error(
      `Error fetching events for project ${projectId}: ${error.message}`,
    );
    result.err = error.message;
    return result;
  }
};
