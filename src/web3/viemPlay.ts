import { decodeEventLog, getContract } from 'viem';
import { Chain } from '../projects';
import { getViem } from './providers';
import { oneHundredxAbi } from '../projects/100x10x1x/abi';

console.log('go time');
const viemTx = async () => {
  const client = getViem(Chain.goerli);

  const logs = await client.getLogs({
    address: '0x87C9Ac13798E2Eb0D0Fa2f6aEEC3e9890a3e28D6',
    // fromBlock: BigInt(8852203),
    // toBlock: BigInt(8923471),
  });

  return logs;
};

viemTx()
  .then((logs) =>
    logs.forEach((log, i) => {
      const decoded = decodeEventLog({
        abi: oneHundredxAbi,
        data: log.data,
        topics: log.topics,
      });

      console.log(`Log #${i + 1}:`, { log, decoded });
    }),
  )
  .catch(console.error);
