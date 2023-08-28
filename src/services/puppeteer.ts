import puppeteer, { type Viewport } from "puppeteer";
import sharp from "sharp";

import type { IAttribute, IScriptInputs } from "../db/schemas/schemaTypes";
import { ProjectId, projectSizes, ProjectSlug } from "../projects";
import { BlobFolder, uploadImage } from "./azureStorage";

const runPuppeteer = async (
  url: string,
  scriptInputs: IScriptInputs,
  projectId: ProjectId,
  size: Viewport,
  esoterra = false,
  getAttributes = true,
) => {
  const browser = await puppeteer.launch({
    defaultViewport: size,
  });

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.once("request", (request) => {
    const data = {
      method: "POST",
      postData: JSON.stringify({ scriptInputs }),
      headers: {
        ...request.headers(),
        "Content-Type": "application/json",
      },
    };

    request.continue(data);

    page.setRequestInterception(false);
  });

  const waitUntil = esoterra ? "load" : "networkidle0";

  await page.goto(url, { waitUntil });

  // need to wait for the full image to generate before taking a screenshot
  if (projectId === ProjectId.negativeCarbon) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  const screenshot = (await page.screenshot({ encoding: "binary" })) as Buffer;

  let attributes: IAttribute[] = [];
  if (getAttributes) {
    attributes = await page.evaluate(() => {
      const newAttributes = sessionStorage.getItem("attributes");

      if (!newAttributes) {
        throw new Error(
          `No attributes found in sessionStorage for token ${scriptInputs.token_id}}`,
        );
      }

      return JSON.parse(newAttributes) as IAttribute[];
    });
  }

  await browser.close();
  return { screenshot, attributes };
};

export const getPuppeteerImageSet = async (
  projectId: ProjectId,
  projectSlug: ProjectSlug,
  tokenId: number,
  generatorUrl: string,
  scriptInputs: IScriptInputs,
  getAttributes = true,
) => {
  const sizes = projectSizes[projectId];

  const isEsoterra = generatorUrl.includes("esoterra=true");

  const { screenshot, attributes } = await runPuppeteer(
    generatorUrl,
    scriptInputs,
    projectId,
    isEsoterra ? { width: 1080, height: 1080 } : sizes.full,
    isEsoterra,
    getAttributes,
  );

  const imageMidBuffer = await sharp(screenshot).resize(sizes.mid).toBuffer();
  const thumbnailBuffer = await sharp(screenshot)
    .resize(sizes.small)
    .toBuffer();

  const image = await uploadImage(screenshot, projectSlug, tokenId);
  const image_mid = await uploadImage(
    imageMidBuffer,
    projectSlug,
    tokenId,
    BlobFolder.mid,
  );
  const image_small = await uploadImage(
    thumbnailBuffer,
    projectSlug,
    tokenId,
    BlobFolder.small,
  );

  return { image, image_mid, image_small, attributes };
};

export const getAttributes = async (
  url: string,
  scriptInputs: IScriptInputs,
): Promise<IAttribute[]> => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.once("request", (request) => {
    const data = {
      method: "POST",
      postData: JSON.stringify({ scriptInputs }),
      headers: {
        ...request.headers(),
        "Content-Type": "application/json",
      },
    };

    request.continue(data);

    page.setRequestInterception(false);
  });

  await page.goto(url, { waitUntil: "networkidle0" });

  const attributes = await page.evaluate(() => {
    const newAttributes = sessionStorage.getItem("attributes");

    if (!newAttributes) {
      throw new Error(
        `No attributes found in sessionStorage for token ${scriptInputs.token_id}}`,
      );
    }

    return JSON.parse(newAttributes) as IAttribute[];
  });

  await browser.close();
  return attributes;
};

// connectionFactory()
//   .then((conn) => {
//     console.log('Connected to DB');
//     return getScriptInputsFromDb(ProjectSlug.chainlifeTestnet, 102, conn);
//   })
//   .then((scriptInputs) => {
//     if (scriptInputs) {
//       console.log('Got script inputs', scriptInputs);
//       return runPuppeteer(
//         'https://api.substratum.art/project/chainlife-testnet/generator/102?esoterra=true',
//         scriptInputs,
//         0,
//         { width: 1080, height: 1080 },
//         Wait.none,
//       );
//     }

//     throw new Error('Could not get script inputs');
//   })
//   .then(({ screenshot }) => {
//     console.log('Got screenshot', screenshot);
//     return uploadImage(screenshot, ProjectSlug.chainlifeTestnet, 102);
//   })
//   .then(console.log)
//   .catch(console.error);
