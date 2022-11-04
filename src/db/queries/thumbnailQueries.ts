import { Connection } from 'mongoose';
import { IThumbnail } from '../schemas/schemaTypes';

export const getThumbnailCounts = async (conn: Connection) => {
  const Thumbnail = conn.model<IThumbnail>('Thumbnail');

  const focus = await Thumbnail.countDocuments({ project_slug: 'focus' });
  const enso = await Thumbnail.countDocuments({ project_slug: 'enso' });

  return { focus, enso };
};

export const getThumbnail = async (conn: Connection, artblocks_id: number) => {
  const Thumbnail = conn.model<IThumbnail>('Thumbnail');

  return Thumbnail.findOne({ artblocks_id });
};

export const getThumbnailsByProject = async (conn: Connection, project_slug: string) => {
  const Thumbnail = conn.model<IThumbnail>('Thumbnail');

  return Thumbnail.find({ project_slug });
};
