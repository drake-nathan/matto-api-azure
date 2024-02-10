import type { Connection } from "mongoose";

import type { Chain, ProjectId } from "../../projects";
import type { IncomingTx } from "../../web3/fetches/fetchEvents";
import type { ITransaction } from "../schemas/schemaTypes";

import { nullAddress } from "../../helpers/constants";
import { getViem } from "../../web3/providers";

export const addTransaction = async (
  incomingTx: IncomingTx,
  project_id: ProjectId,
  conn: Connection,
  chain: Chain,
) => {
  const viem = getViem(chain);
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

  if (doesTxExist) return null;

  const blockTime = (await viem.getBlock({ blockNumber: BigInt(block_number) }))
    .timestamp;

  const parsedTx: ITransaction = {
    block_number,
    event_type,
    project_id,
    token_id: eventName === "OrderChanged" ? undefined : tokenId,
    transaction_date: new Date(Number(blockTime) * 1000),
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

  const query = await Transaction.findOne({ project_id })
    .sort("-block_number")
    .select("block_number");

  return query?.block_number ?? null;
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
