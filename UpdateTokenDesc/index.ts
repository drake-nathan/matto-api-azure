import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { updateTokenDesc } from '../src/db/queries/tokenQueries';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const newDesc =
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\n---**Interactivity:** Chainlife tokens are self-contained applications that have many controls. Here are a basic instructions to get started:\n\n- Click, press, or use the spacebar to start or pause a simulation.\n\n- Use keys 1-5 to change the speed.\n\n- Use keys 6-0 to change the rulesets (these unlock as the token gains levels).\n\n- Use 'Z' to reset the starting population, or refresh the page to entirely restart the simulation.\n\n- For additional help, use 'H'.\n\n- For in-depth instructions, view the documentation, linked from [chainlife.xyz](https://chainlife.xyz/).";

    const updatedTokenCount = await updateTokenDesc(conn, newDesc);

    const message = `Updated ${updatedTokenCount} tokens.`;

    context.log.info(message);
    context.res = {
      status: 200,
      body: message,
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Internal Server Error',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
