import puppeteer from 'puppeteer';
import { IAttribute, IScriptInputs } from '../db/schemas/schemaTypes';

export const runPuppeteer = async (url: string, scriptInputs: IScriptInputs) => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 2160, height: 2160 },
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

  const screenshot = (await page.screenshot({ encoding: 'binary' })) as Buffer;

  const attributes = await page.evaluate(() => {
    const newAttributes = sessionStorage.getItem('attributes');

    return JSON.parse(newAttributes) as IAttribute[];
  });

  await browser.close();
  return { screenshot, attributes };
};
