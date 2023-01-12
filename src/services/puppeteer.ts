import puppeteer, { type Viewport } from 'puppeteer';
import type { IAttribute, IScriptInputs } from '../db/schemas/schemaTypes';
import { ProjectId } from '../projects';

export const runPuppeteer = async (
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
