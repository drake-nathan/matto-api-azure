import { getContract } from "viem";

import { Chain } from "../projects";
import { oneHundredxAbi } from "../projects/100x10x1x/abi";
import { parseSvgAttributes } from "../projects/100x10x1x/helpers/parseSvgAttributes";
import { getViem } from "./providers";

console.log("go time");
const viemTx = async () => {
  const client = getViem(Chain.goerli);

  const contract = getContract({
    abi: oneHundredxAbi,
    address: "0x5Af0264C48eB2fB3D3250e5dd679cfb1D35b624A",
    publicClient: client,
  });

  const svg = await contract.read.getTokenSVG([BigInt(1)]);

  return svg;
};

viemTx()
  .then((svg) => {
    const attributes = parseSvgAttributes(svg);

    console.log({ svg, attributes });
  })
  .catch(console.error);
