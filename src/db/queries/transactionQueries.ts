import type { Connection } from "mongoose";

import type { ProjectId } from "../../projects";
import type { IncomingTx } from "../../web3/fetches/fetchEvents";
import type { ITransaction } from "../schemas/schemaTypes";

import { nullAddress } from "../../helpers/constants";

export const addTransaction = async (
  incomingTx: IncomingTx,
  project_id: ProjectId,
  conn: Connection,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");
  const {
    args: { from, tokenId },
    blockNumber: block_number,
    eventName,
    transactionHash,
  } = incomingTx;

  const transaction_hash = transactionHash.toLowerCase();

  const event_type =
    eventName === "Transfer" && from === nullAddress ? "Mint" : eventName;

  const doesTxExist = await Transaction.findOne({
    block_number,
    event_type,
    project_id,
    transaction_hash,
  });

  if (doesTxExist) {
    return null;
  }

  const parsedTx: ITransaction = {
    block_number,
    event_type,
    project_id,
    token_id: eventName === "OrderChanged" ? undefined : tokenId,
    // This used to pull the real block time, but that was rate-limiting infura, so just saving new date instead
    transaction_date: new Date(),
    transaction_hash,
  };

  const newTx = new Transaction(parsedTx);
  const query = await newTx.save();

  return query;
};

export const getLastTxProcessed = async (
  project_id: number,
  conn: Connection,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  // Get the highest block number from real transactions
  const lastRealTx = await Transaction.findOne({
    event_type: { $ne: "__LAST_PROCESSED_MARKER__" },
    project_id,
  })
    .sort("-block_number")
    .select("block_number");

  // Get the last processed marker
  const lastMarker = await Transaction.findOne({
    event_type: "__LAST_PROCESSED_MARKER__",
    project_id,
  })
    .sort("-block_number")
    .select("block_number");

  const realTxBlock = lastRealTx?.block_number ?? null;
  const markerBlock = lastMarker?.block_number ?? null;

  // Return the highest block number between real transactions and the marker
  if (realTxBlock === null && markerBlock === null) {
    return null;
  }

  if (realTxBlock === null) {
    return markerBlock;
  }

  if (markerBlock === null) {
    return realTxBlock;
  }

  return Math.max(realTxBlock, markerBlock);
};

export const updateLastProcessedBlock = async (
  project_id: number,
  block_number: number,
  conn: Connection,
): Promise<boolean> => {
  try {
    const Transaction = conn.model<ITransaction>("Transaction");

    // Create a special marker transaction to track the last processed block
    // This won't be a real transaction, just a tracking mechanism
    const markerTx: ITransaction = {
      block_number,
      event_type: "__LAST_PROCESSED_MARKER__",
      project_id,
      transaction_date: new Date(),
      transaction_hash: `marker_${project_id}_${block_number}_${Date.now()}`,
    };

    // Remove any existing marker for this project
    await Transaction.deleteMany({
      event_type: "__LAST_PROCESSED_MARKER__",
      project_id,
    });

    // Insert the new marker
    const newMarker = new Transaction(markerTx);
    await newMarker.save();

    return true;
  } catch (error) {
    console.error(
      `Error updating last processed block for project ${project_id}:`,
      error,
    );
    return false;
  }
};

export const getTransactionsByEvent = async (
  conn: Connection,
  project_id: number,
  event_type: string,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = await Transaction.find({ event_type, project_id });

  return query;
};

export const getTransactionCountByEvent = (
  conn: Connection,
  project_id: number,
  event_type: string,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = Transaction.countDocuments({ event_type, project_id });

  return query.exec();
};

export const removeDuplicateTransactions = async (
  conn: Connection,
): Promise<number> => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = await Transaction.aggregate([
    {
      $group: {
        _id: {
          event_type: "$event_type",
          project_id: "$project_id",
          transaction_hash: "$transaction_hash",
        },
        count: { $sum: 1 },
        uniqueIds: { $addToSet: "$_id" },
      },
    },
    { $match: { count: { $gte: 2 } } },
  ]);

  const duplicateIds = query.flatMap((q) => q.uniqueIds.slice(1));

  if (duplicateIds.length) {
    const { deletedCount } = await Transaction.deleteMany({
      _id: { $in: duplicateIds },
    });

    return deletedCount;
  }

  return 0;
};

export const getTxCounts = async (conn: Connection, project_id: number) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = await Transaction.find({ project_id });

  const txCounts = {
    customRules: query.filter((tx) => tx.event_type === "CustomRule").length,
    levelShifts: query.filter((tx) => tx.event_type === "ShiftLevel").length,
    mints: query.filter((tx) => tx.event_type === "Mint").length,
    total: query.length,
    transfers: query.filter((tx) => tx.event_type === "Transfer").length,
  };

  return txCounts;
};

export const checkIfTransactionExists = (
  transaction_hash: string,
  project_id: number,
  conn: Connection,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = Transaction.exists({
    project_id,
    transaction_hash,
  });

  return query.exec();
};

export const resetLastProcessedBlock = async (
  project_id: number,
  conn: Connection,
): Promise<boolean> => {
  try {
    const Transaction = conn.model<ITransaction>("Transaction");

    // Remove any existing marker for this project
    const result = await Transaction.deleteMany({
      event_type: "__LAST_PROCESSED_MARKER__",
      project_id,
    });

    console.log(
      `Reset last processed block for project ${project_id}. Removed ${result.deletedCount} markers.`,
    );
    return true;
  } catch (error) {
    console.error(
      `Error resetting last processed block for project ${project_id}:`,
      error,
    );
    return false;
  }
};
