import { EventData } from 'web3-eth-contract';
import { Connection } from 'mongoose';
import { nullAddress } from '../../constants';
import { projects } from '../../projects/projectsInfo';
import { ITransaction } from '../schemas/schemaTypes';

export const addTransaction = async (incomingTx: EventData, conn: Connection) => {
  const Transaction = conn.model<ITransaction>('Transaction');
  const {
    address: contract_address,
    blockNumber: block_number,
    transactionHash: transaction_hash,
    returnValues,
    event,
  } = incomingTx;
  const { tokenId, _tokenId, from } = returnValues;

  const doesTxExist = await Transaction.exists({ transaction_hash });

  if (doesTxExist) return null;

  const parsedTx: ITransaction = {
    project_id: projects.find((p) => p.contract_address === contract_address)._id,
    block_number,
    transaction_hash,
    event_type: event === 'Transfer' && from === nullAddress ? 'Mint' : event,
    token_id: parseInt(tokenId || _tokenId),
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
