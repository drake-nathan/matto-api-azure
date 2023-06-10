import { processChainlifeEvent, processChainlifeMint } from './projects/chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './projects/mathareHelpers';
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from './projects/negativeCarbonHelpers';
import { processCrystallizedIllusionsMint } from './projects/crystallizedIllusionsHelpers';
import { processTexturesMint } from './projects/textureHelpers';
import { processBlonksEvent, processBlonksMint } from './projects/blonksHelpers';
import { ProjectId } from '../../projects';
import type { ProcessMintFunction, ProcessEventFunction } from './types';
import { process100xMint } from '../../projects/100x10x1x/helpers/processMint';
import { processMfaMint } from '../../projects/mfa/helpers/processMint';

export const getProcessMintFunction = (projectId: ProjectId): ProcessMintFunction => {
  const processMintFunctions: Record<ProjectId, ProcessMintFunction> = {
    [ProjectId.chainlifeMainnet]: processChainlifeMint,
    [ProjectId.chainlifeTestnet]: processChainlifeMint,
    [ProjectId.mathareMemories]: processMathareMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
    [ProjectId.textureAndHues]: processTexturesMint,
    [ProjectId.blonks]: processBlonksMint,
    [ProjectId['100x10x1-A-goerli']]: process100xMint,
    [ProjectId.mfa]: processMfaMint,
  };

  return processMintFunctions[projectId];
};

export const getProcessEventFunction = (
  projectId: ProjectId,
): ProcessEventFunction | null => {
  const processEventFunctions: Record<ProjectId, ProcessEventFunction | null> = {
    [ProjectId.chainlifeMainnet]: processChainlifeEvent,
    [ProjectId.chainlifeTestnet]: processChainlifeEvent,
    [ProjectId.mathareMemories]: processMathareEvent,
    [ProjectId.negativeCarbon]: processNegativeCarbonEvent,
    [ProjectId.crystallizedIllusions]: null,
    [ProjectId.textureAndHues]: null,
    [ProjectId.blonks]: processBlonksEvent,
    [ProjectId['100x10x1-A-goerli']]: null,
    [ProjectId.mfa]: null,
  };

  return processEventFunctions[projectId];
};
