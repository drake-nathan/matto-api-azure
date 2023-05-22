import type { Context } from '@azure/functions';
import type { Connection, Document, LeanDocument, Schema } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../db/schemas/schemaTypes';
import { Chain } from '../../projects';

export type ProcessMintReturn = Promise<
  | {
      newTokenId: number;
      newSupply: number | undefined;
    }
  | undefined
>;

export type ProcessManyMintsReturn = Promise<
  | {
      newTokenIds: number[];
      newSupply: number | undefined;
    }
  | undefined
>;

export type ProcessSingleMintFunction = (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
) => ProcessMintReturn;

export type ProcessManyMintsFunction = (
  token_ids: number[],
  project: IProject,
  chain: Chain,
  context: Context,
  conn: Connection,
) => ProcessManyMintsReturn;

export type ProcessMintFunction = ProcessSingleMintFunction;

export type ProcessEventReturn = Promise<
  | LeanDocument<
      IToken &
        Required<{
          _id: Schema.Types.ObjectId;
        }>
    >
  | Document<IToken>
  | null
>;

export type ProcessEventFunction = (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs: IScriptInputs | null,
) => ProcessEventReturn;
