import type { Context } from "@azure/functions";
import { isEqual } from "lodash";
import type { Connection } from "mongoose";

import type { IProject } from "../../db/schemas/schemaTypes";

export const updateProjectIfNeeded = async (
  project: IProject,
  context: Context,
  conn: Connection,
): Promise<IProject> => {
  const { project_name, project_slug } = project;

  const Project = conn.model<IProject>("Project");

  const projectDb = await Project.findOne({ project_slug });

  if (!projectDb) {
    throw new Error(`No project found for ${project_name}`);
  }

  let isChanged = false;

  for (const key in project) {
    if (!isEqual(project[key], projectDb[key])) {
      projectDb[key] = project[key];
      isChanged = true;
    }
  }

  if (isChanged) {
    await projectDb.save();
  }

  return project;
};
