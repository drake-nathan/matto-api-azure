import type { HttpRequest } from "@azure/functions";

import type { GenScripts, IScriptInputs } from "../src/db/schemas/schemaTypes";

enum ScriptType {
  main,
  alt,
  painting,
}

const getScriptTag = (script: string) => `<script src="${script}"></script>`;

export const getHtml = (
  projectName: string,
  genScripts: GenScripts,
  scriptInputs: null | string,
  options: { mobile: boolean; scriptType: ScriptType },
): string => {
  const {
    alt: altScript,
    main: mainScript,
    mobileControls,
    painting: paintingScript,
    preMainScript,
  } = genScripts;

  const scripts = {
    [ScriptType.alt]: altScript,
    [ScriptType.main]: mainScript,
    [ScriptType.painting]: paintingScript,
  };

  const scriptTags = `
    ${
      scriptInputs
        ? `<script>const scriptInputs = ${scriptInputs};</script>`
        : ""
    }
    ${preMainScript ? getScriptTag(preMainScript) : ""}
    ${getScriptTag(scripts[options.scriptType] ?? mainScript ?? "")}
    ${
      options.mobile && mobileControls && options.scriptType !== ScriptType.alt
        ? getScriptTag(mobileControls)
        : ""
    }
  `;

  const generatorHtml = /* html */ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
          <title>${projectName}</title>
      
          <style type="text/css" id="${projectName} Generator">
            body {
              margin: 0;
              padding: 0;
            }
            canvas {
              ${
                projectName === "Negative Carbon"
                  ? "width: 100% !important; height: auto !important;"
                  : ""
              }
              padding: 0;
              margin: auto;
              display: block;
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
            }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.0.0/p5.min.js"></script>
        </head>
        <body>
          <div id="canvas-container"></div>
          ${scriptTags}
        </body>
      </html>
  `;

  return generatorHtml;
};

export const getScriptType = (
  projectSlug: string,
  genScripts: GenScripts,
  scriptInputsJson: string,
  req: HttpRequest,
): ScriptType => {
  const regex = /esoterra/gi;

  if (!genScripts.alt && !genScripts.painting) return ScriptType.main;

  if (
    (req.query.alt === "false" || req.query.esoterra === "false") &&
    req.query.painting === "false"
  ) {
    return ScriptType.main;
  }

  if (
    (req.query.alt && req.query.alt === "true") ||
    (req.query.esoterra && req.query.esoterra === "true")
  ) {
    return ScriptType.alt;
  }

  if (req.query.painting && req.query.painting === "true")
    return ScriptType.painting;

  if (projectSlug === "chainlife" || projectSlug === "chainlife-testnet") {
    const scriptInputs: IScriptInputs = JSON.parse(scriptInputsJson);
    const { custom_rule } = scriptInputs;

    if (custom_rule && custom_rule.match(regex)) return ScriptType.alt;
  }

  return ScriptType.main;
};
