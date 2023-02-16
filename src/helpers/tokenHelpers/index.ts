import { processChainlifeEvent, processChainlifeMint } from './projects/chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './projects/mathareHelpers';
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from './projects/negativeCarbonHelpers';
import { processCrystallizedIllusionsMint } from './projects/crystallizedIllusionsHelpers';
import { processTexturesMint } from './projects/textureHelpers';
import { ProjectId } from '../../projects';
import type { ProcessMintFunction, ProcessEventFunction } from './types';

export const getProcessMintFunction = (projectId: ProjectId): ProcessMintFunction => {
  const processMintFunctions = {
    [ProjectId.chainlifeMainnet]: processChainlifeMint,
    [ProjectId.chainlifeTestnet]: processChainlifeMint,
    [ProjectId.mathareMemories]: processMathareMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
    [ProjectId.textureAndHues]: processTexturesMint,
  };

  return processMintFunctions[projectId];
};

export const getProcessEventFunction = (
  projectId: ProjectId,
): ProcessEventFunction | null => {
  const processEventFunctions = {
    [ProjectId.chainlifeMainnet]: processChainlifeEvent,
    [ProjectId.chainlifeTestnet]: processChainlifeEvent,
    [ProjectId.mathareMemories]: processMathareEvent,
    [ProjectId.negativeCarbon]: processNegativeCarbonEvent,
    [ProjectId.crystallizedIllusions]: null,
    [ProjectId.textureAndHues]: null,
  };

  return processEventFunctions[projectId];
};