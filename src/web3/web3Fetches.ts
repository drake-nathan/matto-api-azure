/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { Context } from "@azure/functions";
import type { Contract } from "web3-eth-contract";

import type { IAttribute, IScriptInputs } from "../db/schemas/schemaTypes";

export const fetchScriptInputs = async (
  contract: Contract,
  token_id: number,
) => {
  const scriptInputsJson = await contract.methods
    .scriptInputsOf(token_id)
    .call();

  try {
    const parsedScriptInputs: IScriptInputs = JSON.parse(scriptInputsJson);
    return parsedScriptInputs;
  } catch (err) {
    // NOTE: This solved a parse error specifically for Chainlife, but may not work for other projects
    const propertiesArr = scriptInputsJson.split(",");
    const parsedScriptInputs: IScriptInputs = {
      current_owner: JSON.parse(propertiesArr[3].split(":")[1]),
      custom_rule: "",
      level_shift: parseInt(JSON.parse(propertiesArr[6].split(":")[1])),
      previous_owner: JSON.parse(propertiesArr[2].split(":")[1]),
      token_entropy: JSON.parse(propertiesArr[1].split(":")[1]),
      token_id: parseInt(JSON.parse(propertiesArr[0].split(":")[1])),
      transfer_count: parseInt(JSON.parse(propertiesArr[4].split(":")[1])),
    };
    return parsedScriptInputs;
  }
};

export const fetchBase64Textures = async (
  contract: Contract,
  tokenId: number,
  context: Context,
): Promise<{
  attributes: IAttribute[];
  svg: string;
}> => {
  let base64: string;

  try {
    base64 = (await contract.methods.tokenURI(tokenId).call()) as string;
  } catch (err) {
    context.log.error(err);
    return { attributes: [], svg: "" };
  }

  // convert base64 to json
  const json = Buffer.from(base64.split(",")[1], "base64").toString("utf8");
  // parse attributes and image properties from json
  const { attributes, image } = JSON.parse(json);
  // convert image base64 to svg string
  const svg = Buffer.from(image.split(",")[1], "base64").toString("utf8");

  return { attributes, svg };
};
