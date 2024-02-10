import type { Address, Hash } from "viem";

import { z } from "zod";

import { isString } from "./helpers";

export const zodBigIntToNumber = z
  .bigint()
  .transform((x) => Number(x.toString()));

const isEthereumAddress = (value: unknown): value is Address => {
  return isString(value) && /^0x[a-fA-F0-9]{40}$/.test(value);
};
export const zodAddress = z.custom<Address>(isEthereumAddress);

const isTxHash = (value: unknown): value is Hash => {
  return isString(value) && /^0x[a-fA-F0-9]{64}$/.test(value);
};
export const zodHash = z.custom<Hash>(isTxHash);
