import type { Context } from "@azure/functions";

// Use a Map to store counts per function invocation instance if needed,
// but for total counts per function *name*, a simple object is fine.
// Let's start simple.
const rpcCounts: Record<string, number> = {};

/**
 * Increments the RPC call counter for a given Azure Function.
 *
 * @param functionName The name of the Azure Function making the call.
 */
export const incrementRpcCount = (functionName: string): void => {
  if (!rpcCounts[functionName]) {
    rpcCounts[functionName] = 0;
  }
  rpcCounts[functionName]++;
  // Optional: Log every increment for detailed debugging
  // console.log(`RPC Count Incremented: ${functionName} - ${rpcCounts[functionName]}`);
};

/**
 * Logs the final RPC count for a specific function execution.
 * Resets the count for that function for the next invocation.
 *
 * @param context The Azure Functions Context.
 */
export const logRpcCount = (context: Context): void => {
  // Use executionContext for v3
  const functionName = context.executionContext.functionName;
  const count = rpcCounts[functionName] ? rpcCounts[functionName] : 0;
  context.log(
    `[RPC Counter] Function '${functionName}' made ${count} RPC call(s) during this invocation.`,
  );
  // Reset count for this function name after logging for per-invocation counts.
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete rpcCounts[functionName];
};

/**
 * Gets the current count for a function (useful for potential intermediate checks).
 *
 * @param functionName The name of the Azure Function.
 * @returns The current RPC count.
 */
export const getRpcCount = (functionName: string): number =>
  rpcCounts[functionName] ? rpcCounts[functionName] : 0;
