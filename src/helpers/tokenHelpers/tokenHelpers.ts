import { Context } from '@azure/functions';
import { Connection, LeanDocument, Schema } from 'mongoose';
import { IProject, IScriptInputs, IToken, ProjectId } from '../../db/schemas/schemaTypes';
import { processChainlifeEvent, processChainlifeMint } from './chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './mathareHelpers';

type ProcessMintFunction = (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => Promise<{
  newTokenId: number;
  newSupply: number;
}>;

type ProcessEventFunction = (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => Promise<
  LeanDocument<
    IToken &
      Required<{
        _id: Schema.Types.ObjectId;
      }>
  >
>;

export const getProcessMintFunction = (project: IProject): ProcessMintFunction => {
  const { _id: project_id } = project;

  if (
    project_id === ProjectId.chainlifeMainnet ||
    project_id === ProjectId.chainlifeTestnet
  ) {
    return processChainlifeMint;
  }

  if (project_id === ProjectId.mathare) {
    return processMathareMint;
  }
};

export const getProcessEventFunction = (project: IProject): ProcessEventFunction => {
  const { _id: project_id } = project;

  if (
    project_id === ProjectId.chainlifeMainnet ||
    project_id === ProjectId.chainlifeTestnet
  ) {
    return processChainlifeEvent;
  }

  if (project_id === ProjectId.mathare) {
    return processMathareEvent;
  }
};
