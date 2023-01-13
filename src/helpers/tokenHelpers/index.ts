import type { Context } from '@azure/functions';
import type { Connection, LeanDocument, Schema } from 'mongoose';
import type { IProject, IScriptInputs, IToken } from '../../db/schemas/schemaTypes';
import { processChainlifeEvent, processChainlifeMint } from './projects/chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './projects/mathareHelpers';
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from './projects/negativeCarbonHelpers';
import {
  processCrystallizedIllusionsEvent,
  processCrystallizedIllusionsMint,
} from './projects/crystallizedIllusionsHelpers';
import { ProjectId } from '../../projects';

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
    [ProjectId.mathareMemories]: processMathareMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
  };

  return processMintFunctions[projectId];
};

export const getProcessEventFunction = (projectId: ProjectId): ProcessEventFunction => {
  const processEventFunctions = {
    [ProjectId.chainlifeMainnet]: processChainlifeEvent,
    [ProjectId.chainlifeTestnet]: processChainlifeEvent,
    [ProjectId.mathareMemories]: processMathareEvent,
    [ProjectId.negativeCarbon]: processNegativeCarbonEvent,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsEvent,
  };

  return processEventFunctions[projectId];
};
