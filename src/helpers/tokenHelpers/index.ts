import type { ProcessEventFunction, ProcessMintFunction } from "./types";

import { ProjectId } from "../../projects";
import { process100xEvent } from "../../projects/100x10x1x/helpers/processEvent";
import { process100xMint } from "../../projects/100x10x1x/helpers/processMint";
import { processHaikuEvent } from "../../projects/haiku/helpers/processEvent";
import { processHaikuMint } from "../../projects/haiku/helpers/processMint";
import { processMfaMint } from "../../projects/mfa/helpers/processMint";
import {
  processBlonksEvent,
  processBlonksMint,
} from "./projects/BLONKShelpers";
import {
  processChainlifeEvent,
  processChainlifeMint,
} from "./projects/chainlifeHelpers";
import { processCrystallizedIllusionsMint } from "./projects/crystallizedIllusionsHelpers";
import {
  processMathareEvent,
  processMathareMint,
} from "./projects/mathareHelpers";
import {
  processNegativeCarbonEvent,
  processNegativeCarbonMint,
} from "./projects/negativeCarbonHelpers";
import { processTexturesMint } from "./projects/textureHelpers";

export const getProcessMintFunction = (
  projectId: ProjectId,
): ProcessMintFunction => {
  const processMintFunctions: Record<ProjectId, ProcessMintFunction> = {
    [ProjectId.blonks]: processBlonksMint,
    [ProjectId.chainlifeMainnet]: processChainlifeMint,
    [ProjectId.chainlifeTestnet]: processChainlifeMint,
    [ProjectId.crystallizedIllusions]: processCrystallizedIllusionsMint,
    [ProjectId.haiku]: processHaikuMint,
    [ProjectId.mathareMemories]: processMathareMint,
    [ProjectId.mfa]: processMfaMint,
    [ProjectId.negativeCarbon]: processNegativeCarbonMint,
    [ProjectId.textureAndHues]: processTexturesMint,
    [ProjectId["100x10x1-a-goerli"]]: process100xMint,
  };

  return processMintFunctions[projectId];
};

export const getProcessEventFunction = (
  projectId: ProjectId,
): ProcessEventFunction | null => {
  const processEventFunctions: Record<ProjectId, ProcessEventFunction | null> =
    {
      [ProjectId.blonks]: processBlonksEvent,
      [ProjectId.chainlifeMainnet]: processChainlifeEvent,
      [ProjectId.chainlifeTestnet]: processChainlifeEvent,
      [ProjectId.crystallizedIllusions]: null,
      [ProjectId.haiku]: processHaikuEvent,
      [ProjectId.mathareMemories]: processMathareEvent,
      [ProjectId.mfa]: null,
      [ProjectId.negativeCarbon]: processNegativeCarbonEvent,
      [ProjectId.textureAndHues]: null,
      [ProjectId["100x10x1-a-goerli"]]: process100xEvent,
    };

  return processEventFunctions[projectId];
};
