import { type Connection } from "mongoose";
import { type EventData } from "web3-eth-contract";

import { nullAddress } from "../../helpers/constants";
import { Chain, ProjectId } from "../../projects";
import { getViem } from "../../web3/providers";
import type { ITransaction } from "../schemas/schemaTypes";

export const addTransaction = async (
  incomingTx: EventData,
  project_id: ProjectId,
  conn: Connection,
  chain: Chain,
) => {
  const viem = getViem(chain);
  const Transaction = conn.model<ITransaction>("Transaction");
  const {
    blockNumber: block_number,
    transactionHash,
    returnValues,
    event,
  } = incomingTx;
  const { tokenId, from } = returnValues;

  const transaction_hash = transactionHash.toLowerCase();

  const event_type =
    event === "Transfer" && from === nullAddress ? "Mint" : event;

  const doesTxExist = await Transaction.findOne({
    transaction_hash,
    block_number,
    event_type,
    project_id,
  });

  if (doesTxExist) return null;

  const blockTime = (await viem.getBlock({ blockNumber: BigInt(block_number) }))
    .timestamp;

  const parsedTx: ITransaction = {
    project_id,
    block_number,
    transaction_hash,
    transaction_date: new Date(Number(blockTime) * 1000),
    event_type,
    token_id: event === "OrderChanged" ? undefined : parseInt(tokenId),
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

  return query?.block_number || null;
};

export const getAllMintTransactions = async (
  project_id: number,
  conn: Connection,
) => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = await Transaction.find({ project_id, event_type: "Mint" });

  return query;
};

export const removeDuplicateTransactions = async (
  conn: Connection,
): Promise<number> => {
  const Transaction = conn.model<ITransaction>("Transaction");

  const query = await Transaction.aggregate([
    {
      $group: {
        _id: {
          transaction_hash: "$transaction_hash",
          event_type: "$event_type",
          project_id: "$project_id",
        },
        uniqueIds: { $addToSet: "$_id" },
        count: { $sum: 1 },
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
    total: query.length,
    mints: query.filter((tx) => tx.event_type === "Mint").length,
    transfers: query.filter((tx) => tx.event_type === "Transfer").length,
    customRules: query.filter((tx) => tx.event_type === "CustomRule").length,
    levelShifts: query.filter((tx) => tx.event_type === "ShiftLevel").length,
  };

  return txCounts;
};
