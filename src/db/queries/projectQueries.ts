import { Connection } from 'mongoose';
import { IProject } from '../schemas/schemaTypes';

export const addProject = async (projectToAdd: IProject, conn: Connection) => {
  const { _id } = projectToAdd;
  const Project = conn.model<IProject>('Project');

  const doesProjectExist = await Project.exists({ _id });
  if (doesProjectExist) return;

  const newProject = new Project({ id: _id, ...projectToAdd });
  const query = await newProject.save();

  return query;
};

export const getProject = (project_slug: string, conn: Connection) => {
  const Project = conn.model<IProject>('Project');

  const query = Project.findOne({ project_slug });

  query.select('-__v');

  return query.lean().exec();
};

export const getAllProjects = async (conn: Connection) => {
  const Project = conn.model<IProject>('Project');

  const query = await Project.find();
  return query;
};

export const getProjectCurrentSupply = async (project_id: number, conn: Connection) => {
  const Project = conn.model<IProject>('Project');

  const query = await Project.findById({ _id: project_id });

  return query?.current_supply || 0;
};

export const updateProjectSupplyAndCount = async (
  project_id: number,
  current_supply: number,
  tx_count: number,
  conn: Connection,
) => {
  const Project = conn.model<IProject>('Project');

  const query = await Project.findByIdAndUpdate(project_id, { current_supply, tx_count });

  return query.current_supply;
};

export const checkIfNewProjects = async (projects: IProject[], conn: Connection) => {
  const Project = conn.model<IProject>('Project');

  const doAllProjectsExist = await Promise.all(
    projects.map(({ _id }) => Project.exists({ _id })),
  );

  return doAllProjectsExist.includes(null);
};

export const checkIfProjectExists = async (project_slug: string, conn: Connection) => {
  const Project = conn.model<IProject>('Project');

  const query = await Project.exists({ project_slug });
  return !!query;
};
