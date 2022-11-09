import { AzureFunction, Context } from '@azure/functions';
import { Connection } from 'mongoose';
import { connectionFactory } from '../src/db/connectionFactory';
import { addLevelSnapshot } from '../src/db/queries/levelQueries';
import { getLevels } from '../src/db/queries/tokenQueries';
import { ILevelSnapshot } from '../src/db/schemas/schemaTypes';

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection;

  try {
    conn = await connectionFactory(context);

    const project_slug = 'chainlife';
    // NOTE: This would need to be refactored to snapshot multiple projects
    const levels = await getLevels(project_slug, conn);

    const levelSnapshotToAdd: ILevelSnapshot = {
      snapshot_date: new Date(),
      project_slug,
      levels,
    };

    const newLevelSnapshot = await addLevelSnapshot(levelSnapshotToAdd, conn);

    context.log.info(
      'New level snapshot added at',
      newLevelSnapshot.snapshot_date.toLocaleTimeString(),
    );
  } catch (error) {
    context.log.error('SnapshotLevels function error', error);
  } finally {
    await conn.close();
  }
};

export default timerTrigger;
