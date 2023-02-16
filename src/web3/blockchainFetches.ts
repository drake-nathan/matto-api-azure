import type { Contract } from 'web3-eth-contract';
import type { Connection } from 'mongoose';
import type { Context } from '@azure/functions';
import type { IAttribute, IScriptInputs } from '../db/schemas/schemaTypes';
import { getLastTxProcessed } from '../db/queries/transactionQueries';

export const fetchEvents = async (
  contract: Contract,
  events: string[],
  project_id: number,
  conn: Connection,
  creationBlock: number,
  fetchAll = false,
) => {
  const fromBlock = fetchAll
    ? creationBlock
    : (await getLastTxProcessed(project_id, conn)) || creationBlock;
  const options = { fromBlock };

  const allTransactions = await contract.getPastEvents('allEvents', options);
  const filteredTransactions = allTransactions.filter((tx) => events.includes(tx.event));

  return { filteredTransactions, totalTxCount: allTransactions.length };
};

export const fetchScriptInputs = async (contract: Contract, token_id: number) => {
  const scriptInputsJson = await contract.methods.scriptInputsOf(token_id).call();

  try {
    const parsedScriptInputs: IScriptInputs = JSON.parse(scriptInputsJson);
    return parsedScriptInputs;
  } catch (err) {
    const propertiesArr = scriptInputsJson.split(',');
    const parsedScriptInputs: IScriptInputs = {
      token_id: parseInt(JSON.parse(propertiesArr[0].split(':')[1])),
      token_entropy: JSON.parse(propertiesArr[1].split(':')[1]),
      previous_owner: JSON.parse(propertiesArr[2].split(':')[1]),
      current_owner: JSON.parse(propertiesArr[3].split(':')[1]),
      transfer_count: parseInt(JSON.parse(propertiesArr[4].split(':')[1])),
      custom_rule: '',
      level_shift: parseInt(JSON.parse(propertiesArr[6].split(':')[1])),
    };
    return parsedScriptInputs;
  }
};

export const fetchBase64Traits = async (
  contract: Contract,
  tokenId: number,
  context: Context,
): Promise<IAttribute[]> => {
  let base64: string;

  try {
    base64 = (await contract.methods.tokenURI(tokenId).call()) as string;
  } catch (err) {
    context.log.error(err);
    return [];
  }

  const json = Buffer.from(base64.split(',')[1], 'base64').toString('utf8');
  const { attributes } = JSON.parse(json);
  return attributes;
};

// const testFetch = async () => {
//   const project = projects.find((p) => p._id === ProjectId.textureAndHues);

//   if (!project) {
//     throw new Error('Project not found');
//   }

//   const web3 = getWeb3(Chain.mainnet);
//   const contract = getContract(web3, abis[project._id], project.contract_address);

//   return fetchBase64Traits(contract, 1);
// };

// testFetch()
//   .then((res) => console.info(res))
//   .catch(console.error);
