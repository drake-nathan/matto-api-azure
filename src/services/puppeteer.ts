import type { Context } from '@azure/functions';
import puppeteer, { type Viewport } from 'puppeteer';
import sharp from 'sharp';
import type { IAttribute, IScriptInputs } from '../db/schemas/schemaTypes';
import { ProjectId, projectSizes, ProjectSlug } from '../projects';
import { uploadImage } from './azureStorage';

const runPuppeteer = async (
  url: string,
  scriptInputs: IScriptInputs,
  projectId: ProjectId,
  size: Viewport,
) => {
  const browser = await puppeteer.launch({
    defaultViewport: size,
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.once('request', (request) => {
    const data = {
      method: 'POST',
      postData: JSON.stringify({ scriptInputs }),
      headers: {
        ...request.headers(),
        'Content-Type': 'application/json',
      },
    };

    request.continue(data);

    page.setRequestInterception(false);
  });

  await page.goto(url, { waitUntil: 'networkidle0' });

  if (projectId === ProjectId.negativeCarbon) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const screenshot = (await page.screenshot({ encoding: 'binary' })) as Buffer;

  const attributes = await page.evaluate(() => {
    const newAttributes = sessionStorage.getItem('attributes');

    if (!newAttributes) {
      throw new Error(
        `No attributes found in sessionStorage for token ${scriptInputs.token_id}}`,
      );
    }

    return JSON.parse(newAttributes) as IAttribute[];
  });

  await browser.close();
  return { screenshot, attributes };
};

export const getPuppeteerImageSet = async (
  context: Context,
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
  generatorUrl: string,
  scriptInputs: IScriptInputs,
) => {
  const sizes = projectSizes[projectId];

  if (!sizes) throw new Error('No sizes found for project');

  const { screenshot, attributes } = await runPuppeteer(
    generatorUrl,
    scriptInputs,
    projectId,
    sizes.full,
  );

  const imageMidBuffer = await sharp(screenshot).resize(sizes.mid).toBuffer();
  const thumbnailBuffer = await sharp(screenshot).resize(sizes.thumb).toBuffer();

  const image = await uploadImage(context, screenshot, projectSlug, tokenId);
  const image_mid = await uploadImage(
    context,
    imageMidBuffer,
    projectSlug,
    tokenId,
    'images-mid',
  );
  const thumbnail_url = await uploadImage(
    context,
    thumbnailBuffer,
    projectSlug,
    tokenId,
    'thumbnails',
  );

  return { image, image_mid, thumbnail_url, attributes };
};
