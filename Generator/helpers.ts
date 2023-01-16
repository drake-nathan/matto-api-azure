import type { HttpRequest } from '@azure/functions';
import type { GenScripts, IScriptInputs } from '../src/db/schemas/schemaTypes';

const getScriptTag = (script: string) => `<script src="${script}"></script>`;

export const getHtml = (
  projectName: string,
  genScripts: GenScripts,
  scriptInputs: string | null,
  options: { mobile: boolean; alt: boolean },
): string => {
  const { main, mobileControls, alt: altScript, preMainScript } = genScripts;

  const scripts = `
    ${scriptInputs ? `<script>const scriptInputs = ${scriptInputs};</script>` : ''}
    ${preMainScript ? getScriptTag(preMainScript) : ''}
    ${options.alt && altScript ? getScriptTag(altScript) : getScriptTag(main)}
    ${
      options.mobile && mobileControls && !options.alt ? getScriptTag(mobileControls) : ''
    }
  `;

  const generatorHtml = `
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
                projectName === 'Negative Carbon'
                  ? 'width: 100% !important; height: auto !important;'
                  : ''
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
          ${scripts}
        </body>
      </html>
  `;

  return generatorHtml;
};

export const altScriptCheck = (
  projectSlug: string,
  genScripts: GenScripts,
  scriptInputsJson: string,
  req: HttpRequest,
): boolean => {
  const regex = /esoterra/gi;

  if (!genScripts.alt) return false;

  if (
    (req.query?.alt && req.query.alt === 'false') ||
    (req.query?.esoterra && req.query.esoterra === 'false')
  ) {
    return false;
  }

  if (
    (req.query?.alt && req.query.alt === 'true') ||
    (req.query?.esoterra && req.query.esoterra === 'true')
  ) {
    return true;
  }

  if (req.query?.esoterra && req.query.esoterra === 'true') return true;

  if (projectSlug === 'chainlife' || projectSlug === 'chainlife-testnet') {
    const scriptInputs: IScriptInputs = JSON.parse(scriptInputsJson);
    const { custom_rule } = scriptInputs;

    if (custom_rule) return !!custom_rule.match(regex);
  }

  return false;
};
