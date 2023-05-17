import { IToken } from '../../../db/schemas/schemaTypes';
import { ProcessManyMintsFunction } from '../types';
import { allBLONKStraits } from '../../constants';
// import { fetchSVG } from '../../../web3/blockchainFetches';
import { addManyTokens } from '../../../db/queries/tokenQueries';
import {
  updateProjectSupplyAndCount,
  getProjectCurrentSupply,
} from '../../../db/queries/projectQueries';

export const processBlonksMint: ProcessManyMintsFunction = async (
  token_ids,
  project,
  contract,
  context,
  conn,
) => {
  const {
    _id: project_id,
    project_name,
    project_slug,
    artist,
    artist_address,
    description,
    collection_name,
    script_type,
    aspect_ratio,
    website,
    external_url,
    license,
    royalty_info,
    tx_count,
  } = project;

  const newTokens: IToken[] = [];

  context.log.info(`Beginning extraction of ${project_name} svgs from the blockchain`);

  for await (const tokenId of token_ids) {
    // TODO Make unique types for tokens and projects.
    const newToken: IToken = {
      token_id: tokenId,
      // FIXME token name is hardcoded for blonks rn. Abstract out name generation of a token somehow.
      name: `BLONK #${tokenId + 1}`,
      project_id,
      project_name,
      project_slug,
      artist,
      artist_address,
      collection_name,
      description: description || '',
      script_type,
      image: '',
      aspect_ratio,
      website,
      external_url,
      license,
      royalty_info,
      attributes: allBLONKStraits[tokenId],
    };

    try {
      // FIXME - use viem
      // newToken.svg = await fetchSVG(contract, tokenId);
    } catch (err) {
      context.log.error(
        `Failed to fetch svg for ${project_name} ${tokenId} from blockchain`,
        err,
      );
      continue;
    }

    newTokens.push(newToken);
  }

  try {
    await addManyTokens(newTokens, conn);

    const previousSupply = await getProjectCurrentSupply(project_id, conn);
    const newSupply = await updateProjectSupplyAndCount(
      project_id,
      previousSupply + newTokens.length,
      tx_count,
      conn,
    );

    context.log.info(`Added ${newTokens.length} new tokens to ${project_name}.`);
    return { newTokenIds: token_ids, newSupply };
  } catch (err) {
    context.log.error(`Failed to upload bulk mint for ${project_name}`, err);
  }
};

export const processBlonksEvent = () => null;
