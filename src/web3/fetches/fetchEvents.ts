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
    tokenId?: number; // Ensure this is always a number after BigInt conversion
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
  maxBlocksPerInvocation?: number; // New parameter to limit blocks per call
  projectId: number;
}

// Define chunk size as number for Viem path - reduce for better rate limiting
const CHUNK_SIZE = 2000n; // Reduced from 10000n
const MAX_BLOCKS_PER_INVOCATION = 50000; // Default max blocks to process in one function call
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second base delay

// Helper function for exponential backoff
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to convert BigInt values to Numbers in an object
const convertBigIntToNumber = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }

  if (typeof obj === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }

  return obj;
};

export const fetchEvents = async ({
  chain,
  conn,
  context,
  contractAddress,
  creationBlock,
  events,
  fetchAll = false,
  functionName,
  maxBlocksPerInvocation = MAX_BLOCKS_PER_INVOCATION,
  projectId,
}: FetchEventsParams) => {
  // Define return type structure with correct order
  const result: {
    err?: string;
    filteredTransactions: IncomingTx[];
    hasMoreBlocks?: boolean; // Add this to indicate if more blocks need processing
    lastProcessedBlock?: number; // Add this to track progress
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

    // Calculate the target end block for this invocation
    const maxEndBlock = fromBlock + BigInt(maxBlocksPerInvocation);
    const finalEndBlock = latestBlock < maxEndBlock ? latestBlock : maxEndBlock;

    context.log.info(
      `[fetchEvents - ${contractAddress}] Fetching events from block ${fromBlock} to ${finalEndBlock} using Viem (Latest: ${latestBlock})`,
    );

    // Check if we have more blocks to process after this invocation
    result.hasMoreBlocks = finalEndBlock < latestBlock;
    result.lastProcessedBlock = Number(finalEndBlock);

    let currentStartBlock = fromBlock;
    let allTransactions: GetContractEventsReturnType = [];
    let consecutiveFailures = 0;
    let currentChunkSize = CHUNK_SIZE;

    while (currentStartBlock <= finalEndBlock) {
      let currentEndBlock = currentStartBlock + currentChunkSize - 1n;
      if (currentEndBlock > finalEndBlock) {
        currentEndBlock = finalEndBlock;
      }

      context.log.info(
        `[fetchEvents - ${contractAddress}] Processing Viem chunk: ${currentStartBlock} - ${currentEndBlock}`,
      );

      let retryCount = 0;
      let chunkSuccess = false;

      while (retryCount < MAX_RETRIES && !chunkSuccess) {
        try {
          const allTransactionsChunk = await viem.getContractEvents({
            abi: abis[projectId as ProjectId],
            address: contractAddress,
            fromBlock: currentStartBlock,
            toBlock: currentEndBlock,
          });

          allTransactions = allTransactions.concat(allTransactionsChunk);
          chunkSuccess = true;
          consecutiveFailures = 0;

          // Gradually increase chunk size back up if we're successful
          if (currentChunkSize < CHUNK_SIZE) {
            currentChunkSize = BigInt(
              Math.min(Number(currentChunkSize) * 2, Number(CHUNK_SIZE)),
            );
            context.log.info(
              `[fetchEvents - ${contractAddress}] Increased chunk size to ${currentChunkSize}`,
            );
          }
        } catch (error: unknown) {
          retryCount++;
          consecutiveFailures++;

          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const isRateLimit =
            errorMessage.includes("429") ||
            errorMessage.includes("Too Many Requests");

          context.log.warn(
            `[fetchEvents - ${contractAddress}] Retry ${retryCount}/${MAX_RETRIES} for chunk ${currentStartBlock}-${currentEndBlock}: ${errorMessage}`,
          );

          if (isRateLimit) {
            // Reduce chunk size for rate limiting
            if (currentChunkSize > 500n) {
              currentChunkSize = BigInt(
                Math.max(Number(currentChunkSize) / 2, 500),
              );
              context.log.info(
                `[fetchEvents - ${contractAddress}] Rate limited, reduced chunk size to ${currentChunkSize}`,
              );
            }

            // Exponential backoff with jitter
            const backoffDelay =
              BASE_DELAY * Math.pow(2, retryCount - 1) + Math.random() * 1000;
            context.log.info(
              `[fetchEvents - ${contractAddress}] Waiting ${Math.round(backoffDelay)}ms before retry...`,
            );
            await delay(backoffDelay);
          } else if (retryCount >= MAX_RETRIES) {
            context.log.error(
              `[fetchEvents - ${contractAddress}] Max retries exceeded for chunk ${currentStartBlock}-${currentEndBlock}`,
            );
            result.err = `Error fetching Viem events in chunk ${currentStartBlock}-${currentEndBlock} after ${MAX_RETRIES} retries`;
            return result;
          }
        }
      }

      if (!chunkSuccess) {
        result.err = `Failed to fetch chunk ${currentStartBlock}-${currentEndBlock} after ${MAX_RETRIES} retries`;
        return result;
      }

      currentStartBlock = currentEndBlock + 1n;

      // Add a small delay between chunks to be respectful to RPC providers
      if (currentStartBlock <= finalEndBlock) {
        await delay(100); // 100ms delay between chunks
      }
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
        args: convertBigIntToNumber((log as any).args) || {},
        blockNumber: Number(log.blockNumber),
        eventName: (log as any).eventName || "Unknown",
        transactionHash: log.transactionHash,
      }));

    result.filteredTransactions = transformedFilteredTransactions;

    // TODO: Implement logic to update the last processed block in the DB if conn exists
    context.log.info(
      `[fetchEvents - ${contractAddress}] Processed up to block ${finalEndBlock}. Has more blocks: ${result.hasMoreBlocks}`,
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
