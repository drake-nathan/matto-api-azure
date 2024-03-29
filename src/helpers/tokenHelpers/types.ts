import type { Context } from "@azure/functions";
import type { Connection, Document, LeanDocument, Schema } from "mongoose";

import type {
  IProject,
  IScriptInputs,
  IToken,
} from "../../db/schemas/schemaTypes";

export type ProcessMintReturn = Promise<
  | {
      newSupply: number | undefined;
      newTokenId: number;
    }
  | undefined
>;

export type ProcessMintFunction = (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
) => ProcessMintReturn;

export type ProcessEventReturn = Promise<
  | Document<IToken>
  | LeanDocument<
      IToken &
        Required<{
          _id: Schema.Types.ObjectId;
        }>
    >
  | null
>;

export type ProcessEventFunction = (
  token_id: number | undefined,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs: IScriptInputs | undefined,
  event_type?: string,
) => ProcessEventReturn;
