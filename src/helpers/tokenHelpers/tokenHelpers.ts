import { Context } from '@azure/functions';
import { Connection, LeanDocument, Schema } from 'mongoose';
import { IProject, IScriptInputs, IToken, ProjectId } from '../../db/schemas/schemaTypes';
import { processChainlifeEvent, processChainlifeMint } from './chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './mathareHelpers';
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from './negativeCarbonHelpers';
import {
  processCrystallizedIllusionsEvent,
  processCrystallizedIllusionsMint,
} from './crystallizedIllusionsHelpers';

type ProcessMintFunction = (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => Promise<
  | {
      newTokenId: number;
      newSupply: number | undefined;
    }
  | undefined
>;

type ProcessEventFunction = (
  token_id: number,
  project: IProject,
  script_inputs: IScriptInputs,
  context: Context,
  conn: Connection,
) => Promise<LeanDocument<
  IToken &
    Required<{
      _id: Schema.Types.ObjectId;
    }>
> | null>;

export const getProcessMintFunction = (projectId: ProjectId): ProcessMintFunction => {
  const processMintFunctions = {
    [ProjectId.chainlifeMainnet]: processChainlifeMint,
    [ProjectId.chainlifeTestnet]: processChainlifeMint,
    [ProjectId.mathare]: processMathareMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
  };

  return processMintFunctions[projectId];
};

export const getProcessEventFunction = (projectId: ProjectId): ProcessEventFunction => {
  const processEventFunctions = {
    [ProjectId.chainlifeMainnet]: processChainlifeEvent,
    [ProjectId.chainlifeTestnet]: processChainlifeEvent,
    [ProjectId.mathare]: processMathareEvent,
    [ProjectId.negativeCarbon]: processNegativeCarbonEvent,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsEvent,
  };

  return processEventFunctions[projectId];
};
