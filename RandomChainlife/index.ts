import { AzureFunction, Context } from "@azure/functions";

const httpTrigger: AzureFunction = async (context: Context): Promise<void> => {
  try {
    const generatorHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
          <title>Chainlife</title>
      
          <style type="text/css" id="Chainlife Generator">
            body {
              margin: 0;
              padding: 0;
            }
            canvas {
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
          <script src="https://cdn.substratum.art/scripts/chainlife/chainlifeToken-Random.min.js"></script>
        </body>
      </html>
  `;

    context.res = {
      status: 200,
      body: generatorHtml,
      headers: {
        "Content-Type": "text/html",
      },
    };
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      status: 500,
      body: "Something went wrong, ngmi.",
    };
  }
};

export default httpTrigger;
