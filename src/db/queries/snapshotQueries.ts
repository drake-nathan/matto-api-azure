import { Connection } from "mongoose";

import { ILevelSnapshot } from "../schemas/schemaTypes";

export const addLevelSnapshot = async (
  levelSnapshotToAdd: ILevelSnapshot,
  conn: Connection,
) => {
  const LevelSnapshot = conn.model<ILevelSnapshot>("LevelSnapshot");

  const newLevelSnapshot = new LevelSnapshot(levelSnapshotToAdd);
  const query = await newLevelSnapshot.save();

  return query;
};

export const getLevelSnapshots = async (
  conn: Connection,
  projectSlug: string,
) => {
  const LevelSnapshot = conn.model<ILevelSnapshot>("LevelSnapshot");

  const query = await LevelSnapshot.find({ projectSlug }).exec();

  return query;
};
