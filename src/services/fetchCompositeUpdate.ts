import axios from "axios";
import { configDotenv } from "dotenv";

import type { ProjectSlug } from "../projects";

configDotenv();

const compositeUpdateUrl = process.env.COMPOSITE_UPDATE_URL;

if (!compositeUpdateUrl) {
  throw new Error("COMPOSITE_UPDATE_URL not set");
}

export const fetchCompositeUpdate = async ({
  force = false,
  projectSlug,
}: {
  force?: boolean;
  projectSlug: ProjectSlug;
}) => {
  // we are not return anything here, or awaiting the response
  // this simply triggers the function to run
  const params = {
    force,
    projectSlug,
  };

  await axios.get(compositeUpdateUrl, { params });
};
