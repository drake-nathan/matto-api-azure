import { createCanvas, loadImage } from "canvas";
import fs from "fs";
import { JSDOM } from "jsdom";

export const convertSvgToPng = async (
  svgContent: string,
  outputFilePath: string,
): Promise<void> => {
  // Parse SVG using JSDOM
  const dom = new JSDOM(svgContent);
  const { document } = dom.window;
  const svgElement = document.querySelector("svg");

  if (!svgElement) {
    throw new Error("SVG element not found in the file");
  }

  // Get dimensions from the viewBox attribute
  const viewBox = svgElement.getAttribute("viewBox");
  if (!viewBox) {
    throw new Error("No viewBox attribute found");
  }

  const [minX, minY, width, height] = viewBox.split(" ").map(Number);
  if (
    Number.isNaN(width) ||
    Number.isNaN(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error("Invalid dimensions in viewBox");
  }
  // Create a canvas and draw the SVG onto it
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Load the SVG as an image
  const image = await loadImage(
    `data:image/svg+xml,${encodeURIComponent(svgContent)}`,
  );
  ctx.drawImage(image, 0, 0, width, height);

  // Save the canvas as a PNG file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFilePath, buffer);
};

convertSvgToPng(
  `<?xml version="1.0" encoding="utf-8"?><svg viewBox="0 0 2160 3840" xmlns="http://www.w3.org/2000/svg"><filter id="Bevel" filterUnits="objectBoundingBox" x="-10%" y="-10%" width="150%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"/><feSpecularLighting in="blur" surfaceScale="1" specularConstant=".2" specularExponent="120" result="specOut" lighting-color="pink"><fePointLight x="-5000" y="-10000" z="20000"/></feSpecularLighting><feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2"/><feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint"/></filter><g id="token-36" style="stroke-linecap:round;fill-rule:evenodd;stroke-linejoin:round" filter="url(#Bevel)"><g id="path-group-0" style="stroke:#530256;fill:#530256;stroke-width:20px"><polygon points="1950 1223 833 1006 1760 2765 2056 695 1879 2845 811 924 "/><path d="M62 286 C973 1182 927 2046 1516 3293 S1813 1861 1379 3008 C1841 1928 2130 4519 1527 3330 S1045 1148 62 286"/><polygon points="1813 1861 1379 3008 1283 1772 814 857 1399 1856 1434 2947 "/><path d="M712 37 C1489 140 1861 2884 1037 1461 S1361 3632 150 2168 C1354 3648 239 -35 1102 1390 S1531 151 712 37"/></g><g id="path-group-1" style="stroke:#5500de;fill:#5500de;stroke-width:15px"><path d="M969 3171 C1470 3068 1796 1777 467 1963 C1723 1906 1526 3154 969 3171"/><polygon points="114 1256 1670 1190 1562 3820 0 1823 1630 3777 1727 1092 "/><polygon points="911 2197 259 1812 436 471 1592 3342 385 351 336 1728 "/><ellipse cx="1494" cy="1560" rx="35" ry="14" transform="rotate(57, 1494, 1560)"/></g><g id="path-group-2" style="stroke:#2f89ff;fill:#2f89ff;stroke-width:5px"><path d="M667 1415 C1201 752 2095 2541 1985 248 S773 2722 888 1535 C773 2699 1824 -1996 1923 318 S1178 699 667 1415"/><path d="M773 2722 C888 1535 104 170 436 878 C80 293 887 1445 773 2722"/></g></svg>`,
  "test.png",
).catch(console.error);
