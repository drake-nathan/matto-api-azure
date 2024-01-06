import { AzureFunction, Context } from "@azure/functions";
import { Connection } from "mongoose";

import { connectionFactory } from "../src/db/connectionFactory";
import { addLevelSnapshot } from "../src/db/queries/snapshotQueries";
import { getLevels } from "../src/db/queries/tokenQueries";
import { ILevelSnapshot } from "../src/db/schemas/schemaTypes";
import { ProjectSlug } from "../src/projects";

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  let conn: Connection | undefined;

  try {
    conn = await connectionFactory(context);

    const project_slug = ProjectSlug.chainlifeMainnet;
    // NOTE: This would need to be refactored to snapshot multiple projects
    const levels = await getLevels(project_slug, conn);

    const levelSnapshotToAdd: ILevelSnapshot = {
      levels,
      project_slug,
      snapshot_date: new Date(),
    };

    const newLevelSnapshot = await addLevelSnapshot(levelSnapshotToAdd, conn);

    context.log.info(
      "New level snapshot added at",
      newLevelSnapshot.snapshot_date.toLocaleTimeString(),
    );
  } catch (error) {
    context.log.error("SnapshotLevels function error", error);
  } finally {
    if (conn) await conn.close();
  }
};

export default timerTrigger;
