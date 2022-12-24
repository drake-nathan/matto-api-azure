import Web3 from 'web3';
import { EventData } from 'web3-eth-contract';
import { Connection } from 'mongoose';
import { nullAddress } from '../../helpers/constants';
import { projects } from '../../projects';
import { ITransaction } from '../schemas/schemaTypes';

export const addTransaction = async (
  incomingTx: EventData,
  conn: Connection,
  web3: Web3,
) => {
  const Transaction = conn.model<ITransaction>('Transaction');
  const {
    address: contract_address,
    blockNumber: block_number,
    transactionHash,
    returnValues,
    event,
  } = incomingTx;
  const { tokenId, from } = returnValues;

  const transaction_hash = transactionHash.toLowerCase();

  const doesTxExist = await Transaction.exists({ transaction_hash });

  if (doesTxExist) return null;

  const blockTime = (await web3.eth.getBlock(block_number)).timestamp as number;

  const parsedTx: ITransaction = {
    project_id: projects.find((p) => p.contract_address === contract_address)._id,
    block_number,
    transaction_hash,
    transaction_date: new Date(blockTime * 1000),
    event_type: event === 'Transfer' && from === nullAddress ? 'Mint' : event,
    token_id: parseInt(tokenId),
  };

  const newTx = new Transaction(parsedTx);
  const query = await newTx.save();

  return query;
};

export const getLastTxProcessed = async (project_id: number, conn: Connection) => {
  const Transaction = conn.model<ITransaction>('Transaction');

  const query = await Transaction.findOne({ project_id })
    .sort('-block_number')
    .select('block_number');

  return query?.block_number || null;
};

export const getAllMintTransactions = async (project_id: number, conn: Connection) => {
  const Transaction = conn.model<ITransaction>('Transaction');

  const query = await Transaction.find({ project_id, event_type: 'Mint' });

  return query;
};

export const removeDuplicateTransactions = async (conn: Connection) => {
  const Transaction = conn.model<ITransaction>('Transaction');

  const query = await Transaction.aggregate([
    {
      $group: {
        _id: { transaction_hash: '$transaction_hash' },
        uniqueIds: { $addToSet: '$_id' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gte: 2 } } },
  ]);

  const duplicateIds = query.map((q) => q.uniqueIds[1]);

  if (duplicateIds.length) {
    const { deletedCount } = await Transaction.deleteMany({ _id: { $in: duplicateIds } });

    return deletedCount;
  }
  // else
  return 0;
};

export const getTxCounts = async (conn: Connection, project_id: number) => {
  const Transaction = conn.model<ITransaction>('Transaction');

  const query = await Transaction.find({ project_id });

  const txCounts = {
    total: query.length,
    mints: query.filter((tx) => tx.event_type === 'Mint').length,
    transfers: query.filter((tx) => tx.event_type === 'Transfer').length,
    customRules: query.filter((tx) => tx.event_type === 'CustomRule').length,
    levelShifts: query.filter((tx) => tx.event_type === 'ShiftLevel').length,
  };

  return txCounts;
};
