import type { Context } from '@azure/functions';
import type { Connection, LeanDocument, Schema } from 'mongoose';
import { Contract } from 'web3-eth-contract';
import type { IProject, IScriptInputs, IToken } from '../../db/schemas/schemaTypes';

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
  contract: Contract,
  context: Context,
  conn: Connection,
) => ProcessManyMintsReturn;

export type ProcessMintFunction = ProcessSingleMintFunction;

export type ProcessEventReturn = Promise<LeanDocument<
  IToken &
    Required<{
      _id: Schema.Types.ObjectId;
    }>
> | null>;

export type ProcessEventFunction = (
  token_id: number,
  project: IProject,
  context: Context,
  conn: Connection,
  script_inputs?: IScriptInputs,
) => ProcessEventReturn;
