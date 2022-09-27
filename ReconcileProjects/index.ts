import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { projects } from '../src/projects/projectsInfo';
import { checkForNewProjects, reconcileProject } from '../src/helpers/projectHelpers';
import { connectionFactory } from '../src/db/connectionFactory';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    await checkForNewProjects(context, projects, conn);

    const reconcileAllProjects = async () => {
      await Promise.all(
        projects.map((project) => reconcileProject(context, project, conn)),
      );
    };

    await reconcileAllProjects();
  } catch (error) {
    context.log.error(error);
    context.res = {
      status: 500,
      body: error,
    };
  } finally {
    await conn.close();
  }
};

export default timerTrigger;
