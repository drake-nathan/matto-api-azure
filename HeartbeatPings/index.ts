import { AzureFunction, Context } from "@azure/functions";
import axios from "axios";

const timerTrigger: AzureFunction = async (context: Context): Promise<void> => {
  const urls = ["https://chainlife.xyz/", "https://substratum.art/"];

  try {
    await Promise.allSettled(urls.map((url) => axios.get(url)));
  } catch (error) {
    context.log.error(error);
    if (process.env.NODE_ENV === "test") console.error(error);
    context.res = {
      body: error,
      status: 500,
    };
  }
};

export default timerTrigger;
