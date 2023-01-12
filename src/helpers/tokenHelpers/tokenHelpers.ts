import type { Context } from '@azure/functions';
import type { Connection, LeanDocument, Schema } from 'mongoose';
import type { Viewport } from 'puppeteer';
import type { IProject, IScriptInputs, IToken } from '../../db/schemas/schemaTypes';
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
import { ProjectId, projectSizes, ProjectSlug } from '../../projects';
import { runPuppeteer } from '../../services/puppeteer';
import { uploadImage } from '../../services/azureStorage';

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

export const getImageSet = async (
  context: Context,
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
  generatorUrl: string,
  scriptInputs: IScriptInputs,
) => {
  const sizes = projectSizes[projectId];

  if (!sizes) throw new Error('No sizes found for project');

  const getScreenshot = async (size: Viewport) => {
    const { screenshot, attributes } = await runPuppeteer(
      generatorUrl,
      scriptInputs,
      projectId,
      size,
    );

    return { screenshot, attributes };
  };

  const { screenshot: screenshotFull, attributes } = await getScreenshot(sizes.full);
  const image = await uploadImage(context, screenshotFull, projectSlug, tokenId);

  const { screenshot: screenshotMid } = await getScreenshot(sizes.mid);
  const image_mid = await uploadImage(
    context,
    screenshotMid,
    projectSlug,
    tokenId,
    'images_mid',
  );

  const { screenshot: thumbnail } = await getScreenshot(sizes.thumb);
  const thumbnail_url = await uploadImage(
    context,
    thumbnail,
    projectSlug,
    tokenId,
    'thumbnails',
  );

  return { image, image_mid, thumbnail_url, attributes };
};
