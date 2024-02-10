import type { Context } from "@azure/functions";
import type { Connection } from "mongoose";
import type { Contract } from "web3-eth-contract";

import type { IProject } from "../../db/schemas/schemaTypes";
import type { IncomingTx } from "../../web3/fetches/fetchEvents";

import { updateProjectSupplyAndCount } from "../../db/queries/projectQueries";
import {
  getCurrentTokenSupply,
  removeDuplicateTokens,
} from "../../db/queries/tokenQueries";
import { getTransactionsByEvent } from "../../db/queries/transactionQueries";
import { nullAddress } from "../constants";
import { processNewTransactions } from "../transactionHelpers/processNewTransactions";

export const reconcileTokens = async ({
  allTransactions,
  conn,
  context,
  contract,
  project,
  totalTokensInDb,
  totalTxCount,
}: {
  allTransactions: IncomingTx[];
  conn: Connection;
  context: Context;
  contract: Contract;
  project: IProject;
  totalTokensInDb: number;
  totalTxCount: number;
}) => {
  const { _id: project_id, project_name } = project;

  const totalMintTransactions = allTransactions.filter(
    (tx) => tx.eventName === "Transfer" && tx.args.from === nullAddress,
  ).length;

  context.log.info("Total mint transactions:", totalMintTransactions);
  context.log.info("Total tokens in db:", totalTokensInDb);

  if (totalMintTransactions === totalTokensInDb) {
    context.log.info(`${project_name} has been fully reconciled.`);
    await updateProjectSupplyAndCount(
      project_id,
      totalTokensInDb,
      totalTxCount,
      conn,
    );
  } else {
    if (totalMintTransactions < totalTokensInDb) {
      context.log.error(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      await removeDuplicateTokens(project_id, conn);
    } else {
      context.log.error(
        `${project_name} has a token count discrepancy, attempting to fix.`,
      );
      const allMintTransactions = (
        await getTransactionsByEvent(conn, project_id, "Mint")
      ).sort((a, b) => {
        if (a.token_id && b.token_id) {
          return a.token_id - b.token_id;
        }
        return 0;
      });

      await processNewTransactions(
        allMintTransactions,
        project,
        contract,
        context,
        conn,
      );
    }

    const newTotalTokensInDb = await getCurrentTokenSupply(project_id, conn);
    if (totalMintTransactions === newTotalTokensInDb) {
      context.log.info(`${project_name} has been fully reconciled.`);
      await updateProjectSupplyAndCount(
        project_id,
        newTotalTokensInDb,
        totalTxCount,
        conn,
      );
    } else {
      context.log.error(
        `${project_name} still has a token count discrepancy, please check the database.`,
      );
    }
  }
};
