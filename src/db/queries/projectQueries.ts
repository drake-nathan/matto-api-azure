import type { Connection } from "mongoose";

import type { ProjectSlug } from "../../projects";
import type { IProject } from "../schemas/schemaTypes";

export const addProject = async (projectToAdd: IProject, conn: Connection) => {
  const { _id } = projectToAdd;
  const Project = conn.model<IProject>("Project");

  const doesProjectExist = await Project.exists({ _id });
  if (doesProjectExist) return;

  const newProject = new Project({ id: _id, ...projectToAdd });
  const query = await newProject.save();

  return query;
};

export const getProject = (project_slug: ProjectSlug, conn: Connection) => {
  const Project = conn.model<IProject>("Project");

  const query = Project.findOne({ project_slug });

  return query
    .select("-__v -gen_scripts._id -dev_params -royalty_info._id")
    .lean()
    .exec();
};

export const getAllProjects = (conn: Connection) => {
  const Project = conn.model<IProject>("Project");

  const query = Project.find();

  return query;
};

export const getProjectCurrentSupply = async (
  project_id: number,
  conn: Connection,
) => {
  const Project = conn.model<IProject>("Project");

  const query = await Project.findById({ _id: project_id });

  return query?.current_supply || 0;
};

export const updateProjectSupplyAndCount = async (
  project_id: number,
  current_supply: number,
  tx_count: number,
  conn: Connection,
) => {
  const Project = conn.model<IProject>("Project");

  const query = await Project.findByIdAndUpdate(project_id, {
    current_supply,
    tx_count,
  });

  return query?.current_supply;
};

export const checkIfNewProjects = async (
  projects: IProject[],
  conn: Connection,
) => {
  const Project = conn.model<IProject>("Project");

  const doAllProjectsExist = await Promise.all(
    projects.map(({ _id }) => Project.exists({ _id })),
  );

  return doAllProjectsExist.includes(null);
};

export const checkIfProjectExists = async (
  project_slug: ProjectSlug,
  conn: Connection,
) => {
  const Project = conn.model<IProject>("Project");

  const query = await Project.exists({ project_slug });
  return !!query;
};

export const updateCollectionDescription = (
  conn: Connection,
  project_slug: ProjectSlug,
  newDescription: string,
) => {
  const Project = conn.model<IProject>("Project");

  const query = Project.findOneAndUpdate(
    { project_slug },
    { collection_description: newDescription },
    { new: true },
  );

  return query.exec();
};

export const updateTokenDescription = (
  conn: Connection,
  project_slug: ProjectSlug,
  newDescription: string,
) => {
  const Project = conn.model<IProject>("Project");

  const query = Project.findOneAndUpdate(
    { project_slug },
    { description: newDescription },
    { new: true },
  );

  return query.exec();
};

export const updateAppendedDescription = (
  conn: Connection,
  project_slug: ProjectSlug,
  newDescription: string,
) => {
  const Project = conn.model<IProject>("Project");

  const query = Project.findOneAndUpdate(
    { project_slug },
    { appended_description: newDescription },
    { new: true },
  );

  return query.exec();
};
