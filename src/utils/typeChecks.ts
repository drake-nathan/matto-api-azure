import { ProjectSlug } from "../projects";

export const isNumber = (value: unknown): value is number =>
  typeof value === "number";

export const isProjectSlug = (value: unknown): value is ProjectSlug => {
  return Object.values(ProjectSlug).includes(value as ProjectSlug);
};
