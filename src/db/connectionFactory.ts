import type { Context } from "@azure/functions";

import * as dotenv from "dotenv";
import { Schema, createConnection } from "mongoose";

import { levelSnapshotSchema } from "./schemas/levelSnapshot";
import { projectSchema } from "./schemas/project";
import { thumbnailSchema } from "./schemas/thumbnail";
import { tokenSchema } from "./schemas/token";
import { transactionSchema } from "./schemas/transaction";

export const connectionFactory = async (context?: Context) => {
  dotenv.config();
  const dbConnectionString = process.env.DB_CONNECTION_STRING;

  if (!dbConnectionString) {
    throw new Error("DB_CONNECTION_STRING not found in .env");
  }

  // mongoose config: set a validator function that allows empty strings
  Schema.Types.String.checkRequired((v) => typeof v === "string");

  const conn = await createConnection(dbConnectionString).asPromise();

  if (context) {
    conn.addListener("error", (err) => {
      context.log.error("Error connecting to database", err);
    });
  }

  conn.model("Project", projectSchema);
  conn.model("Token", tokenSchema);
  conn.model("Transaction", transactionSchema);
  conn.model("Thumbnail", thumbnailSchema);
  conn.model("LevelSnapshot", levelSnapshotSchema);

  return conn;
};
