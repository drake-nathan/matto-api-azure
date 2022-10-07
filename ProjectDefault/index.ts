import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { getAllProjects } from '../src/db/queries/projectQueries';
import { connectionFactory } from '../src/db/connectionFactory';

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  dotenv.config();
  const rootUrl = process.env.ROOT_URL;

  try {
    conn = await connectionFactory(context);

    const projects = await getAllProjects(conn);

    if (!projects) {
      context.res = {
        status: 400,
        body: 'No projects on this server.',
      };
      return;
    }

    const getUrl = (slug: string) => `${rootUrl}/project/${slug}`;

    const projectsList = projects.map(
      ({ project_name, project_slug }) =>
        `<a href="${getUrl(project_slug)}"><li>${project_name}</li></a>`,
    );

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
          <title>Chainlife</title>
      
          <style type="text/css">
            * {
              box-sizing: border-box;
              font-family: sans-serif;
              text-align: center;
            }
      
            .container {
              max-width: 960px;
              margin: 0 auto;
            }

            ul {
              list-style: none;
              margin: 0 auto;
            }

            li {
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div id="container">
            <h1>Projects</h1>
            <ul>
              ${projectsList}
            </ul>
          </div>
        </body>
      </html>    
  `;

    context.res = {
      status: 200,
      body: html,
      headers: {
        'Content-Type': 'text/html',
      },
    };
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: 'Something went wrong, ngmi.',
    };
  } finally {
    await conn.close();
  }
};

export default httpTrigger;
