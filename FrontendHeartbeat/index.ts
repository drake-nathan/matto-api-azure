import { AzureFunction, Context } from '@azure/functions';
import axios from 'axios';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const url = 'https://chainlife.xyz/';

  try {
    const res = axios.get(url);

    if (res) context.log.info('Frontend heartbeat successful');
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  }
};

export default timerTrigger;
