import { processChainlifeEvent, processChainlifeMint } from './projects/chainlifeHelpers';
import { processMathareEvent, processMathareMint } from './projects/mathareHelpers';
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from './projects/negativeCarbonHelpers';
import { processCrystallizedIllusionsMint } from './projects/crystallizedIllusionsHelpers';
import { processTexturesMint } from './projects/textureHelpers';
import { processBLONKSMint, processBLONKSEvent } from './projects/BLONKShelpers';
import { ProjectId } from '../../projects';
import type { ProcessMintFunction, ProcessEventFunction } from './types';

export const getProcessMintFunction = (projectId: ProjectId): ProcessMintFunction => {
  const processMintFunctions: { [key: string]: ProcessMintFunction } = {
    [ProjectId.chainlifeMainnet]: processChainlifeMint,
    [ProjectId.chainlifeTestnet]: processChainlifeMint,
    [ProjectId.mathareMemories]: processMathareMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
    [ProjectId.textureAndHues]: processTexturesMint,
    // [ProjectId.blonks]: null,
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
    [ProjectId.blonks]: null,
  };

  return processEventFunctions[projectId];
};
