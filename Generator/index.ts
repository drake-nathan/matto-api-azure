import { AzureFunction, Context } from '@azure/functions';
import { connect, disconnect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { fetchScriptInputs } from '../src/web3/blockchainFetches';
import { getProject } from '../src/db/queries/projectQueries';
import { getContract } from '../src/web3/contract';
import { abis } from '../src/projects/projectsInfo';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING as string;

  if (!dbConnectionString) {
    throw new Error('DB_CONNECTION_STRING not found in .env');
  }

  const { project_slug, token_id } = context.bindingData;
  const wasDbAlreadyConnected = connection.readyState === 1;

  try {
    if (!wasDbAlreadyConnected) await connect(dbConnectionString);

    const project = await getProject(project_slug);

    if (!project) {
      context.res = {
        status: 404,
        body: 'Project not found',
      };
      if (!wasDbAlreadyConnected) return await disconnect();
      return;
    }

    const { _id: project_id, contract_address } = project;
    const contract = getContract(abis[project_id], contract_address);
    const scriptInputs = await fetchScriptInputs(contract, token_id);

    const generatorHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
        <title>Chainlife</title>
    
        <style type="text/css" id="Chainlife Generator">
          body {
            margin: 0;
            padding: 0;
          }
    
          canvas {
            padding: 0;
            margin: auto;
            display: block;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
          }
        </style>
    
        <script type="text/javascript" defer>
          const scriptInputs = ${JSON.stringify(scriptInputs)};
        </script>
    
        <script
          type="text/javascript"
          defer
          src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"
        ></script>
    
        <script
          type="text/javascript"
          defer
          src="https://matto-cdn.azureedge.net/scripts/chainlife.min.js"
        ></script>
      </head>
    
      <body>
        <canvas></canvas>
      </body>
    </html>
  `;

    context.res = {
      status: 200,
      body: generatorHtml,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'This token may not be minted yet.',
    };
  } finally {
    if (!wasDbAlreadyConnected) await disconnect();
  }
};

export default httpTrigger;
