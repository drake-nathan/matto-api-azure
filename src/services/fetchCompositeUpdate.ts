import axios from "axios";
import { configDotenv } from "dotenv";

import { ProjectSlug } from "../projects";

configDotenv();

const rootUrl = process.env.ROOT_URL;

if (!rootUrl) {
  throw new Error("ROOT_URL not set");
}

export const fetchCompositeUpdate = ({
  projectSlug,
}: {
  projectSlug: ProjectSlug;
}) => {
  // we are not return anything here, or awaiting the response
  // this simply triggers the function to run
  axios.get(`${rootUrl}/convert-token-zero/${projectSlug}`);
};
