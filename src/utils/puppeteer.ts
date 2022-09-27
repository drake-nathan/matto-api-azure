import puppeteer from 'puppeteer';
import { IAttribute } from '../db/schemas/schemaTypes';

export const runPuppeteer = async (url: string) => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 2160, height: 2160 },
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const screenshot = (await page.screenshot({ encoding: 'binary' })) as Buffer;

  const attributes = await page.evaluate(() => {
    const newAttributes = sessionStorage.getItem('attributes');

    return JSON.parse(newAttributes) as IAttribute[];
  });

  await browser.close();
  return { screenshot, attributes };
};
