import axios, { type AxiosRequestConfig } from "axios";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const openseaApiKey = process.env.OPENSEA_API_KEY;

if (!openseaApiKey) {
  throw new Error("OPENSEA_API_KEY is not set");
}

export const openseaRefresh = async (address: string, tokenId: number) => {
  const config: AxiosRequestConfig = {
    headers: {
      "X-API-KEY": openseaApiKey,
    },
    url: `https://api.opensea.io/api/v1/asset/${address}/${tokenId}/?force_update=true`,
  };

  const response = await axios(config);

  return response;
};
