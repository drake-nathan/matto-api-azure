import type { IAttribute } from '../../../db/schemas/schemaTypes';

export const parseSvgAttributes = (svgString: string): IAttribute[] | null => {
  // create a new DOMParser
  const parser = new DOMParser();

  // use the DOMParser to parse the SVG string
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // find the <desc> tag
  const desc = doc.querySelector('desc');

  // if the <desc> tag exists and it has content...
  if (desc && desc.textContent) {
    // parse the content of the <desc> tag as JSON
    const json = JSON.parse(desc.textContent);

    // return the 'attributes' property of the parsed JSON
    return json.attributes;
  }

  // if there was no <desc> tag or it had no content, return null
  return null;
};
