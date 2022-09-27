import { IProject } from '../models/modelTypes';
import { Project } from '../models/project';

export const addProject = async (projectToAdd: IProject) => {
  const { _id } = projectToAdd;

  const doesProjectExist = await Project.exists({ _id });
  if (doesProjectExist) return;

  const newProject = new Project({ id: _id, ...projectToAdd });
  const query = await newProject.save();

  return query;
};

export const getProject = (project_slug: string) => {
  const query = Project.findOne({ project_slug });

  query.select('-__v');

  return query.lean().exec();
};

export const getAllProjects = async () => {
  const query = await Project.find();
  return query;
};

export const getProjectCurrentSupply = async (project_id: number) => {
  const query = await Project.findById({ _id: project_id });

  return query.current_supply || 0;
};

export const updateProjectCurrentSupply = async (
  project_id: number,
  current_supply: number,
) => {
  const query = await Project.findByIdAndUpdate(project_id, { current_supply });

  return query.current_supply;
};

export const checkIfNewProjects = async (projects: IProject[]) => {
  const doAllProjectsExist = await Promise.all(
    projects.map(({ _id }) => Project.exists({ _id })),
  );

  return doAllProjectsExist.includes(null);
};

export const checkIfProjectExists = async (project_slug: string) => {
  const query = await Project.exists({ project_slug });
  return query;
};
