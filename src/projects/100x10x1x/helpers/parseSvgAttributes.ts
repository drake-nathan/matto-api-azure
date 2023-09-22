import Hjson from "hjson";
import { JSDOM } from "jsdom";

import type { IAttribute } from "../../../db/schemas/schemaTypes";

export const parseSvgAttributes = (svgString?: string): IAttribute[] | null => {
  if (!svgString) return null;

  // use JSDOM to parse the SVG string
  const dom = new JSDOM(svgString, {
    contentType: "image/svg+xml",
  });

  // get the window.document
  const doc = dom.window.document;

  // find the <desc> tag
  const desc = doc.querySelector("desc");

  // if the <desc> tag exists and it has content...
  if (desc && desc.textContent) {
    // parse the content of the <desc> tag using Hjson
    const json = Hjson.parse(desc.textContent);

    // return the 'attributes' property of the parsed JSON
    return json.attributes;
  }

  // if there was no <desc> tag or it had no content, return null
  return null;
};
