import type { Contract } from 'web3-eth-contract';
import type { Connection } from 'mongoose';
import { type IScriptInputs } from '../db/schemas/schemaTypes';
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

// const testFetchEvents = async () => {
//   const project = projects.find((p) => p._id === ProjectId.crystallizedIllusions);

//   const conn = await connectionFactory();

//   if (!project) {
//     throw new Error('Project not found');
//   }

//   const web3 = getWeb3(Chain.mainnet);
//   const contract = getContract(web3, abis[project._id], project.contract_address);

//   return fetchEvents(contract, [], project._id, conn, project.creation_block, true);
// };

// testFetchEvents()
//   .then((res) => console.log(res.allTransactions))
//   .catch(console.error);
