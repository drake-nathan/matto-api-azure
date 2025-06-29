import type { GetContractEventsReturnType } from "viem";

import { decodeEventLog } from "viem";

/**
 * Filters a list of Viem contract event logs based on a provided list of event names.
 * Decodes the event logs to extract event names and filters based on provided event names.
 *
 * @param allTransactions - The array of event logs fetched from Viem.
 * @param eventsToFilter - An array of event names (strings) to keep.
 * @returns The filtered array of event logs.
 */
export const filterRelevantTransactions = (
  allTransactions: GetContractEventsReturnType,
  eventsToFilter: string[], // Assuming events is string[] based on usage context
): GetContractEventsReturnType => {
  // Filter based on eventName property that should exist on Viem contract events
  const filtered = allTransactions.filter((eventLog) => {
    // In Viem contract events, eventName should be available when using getContractEvents with ABI
    const eventName = (eventLog as any).eventName;
    return eventName && eventsToFilter.includes(eventName);
  });

  return filtered; // Return the filtered list
};
