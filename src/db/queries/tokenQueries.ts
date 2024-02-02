import type { Connection } from "mongoose";

import type { ProjectId, ProjectSlug } from "../../projects";
import type {
  IAttribute,
  ILevel,
  IScriptInputs,
  IToken,
  TokenAbbr,
} from "../schemas/schemaTypes";

export const checkIfTokenExists = async (
  token_id: number,
  project_slug: ProjectSlug,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = await Token.exists({ project_slug, token_id });
  return query;
};

export const getTokenDoc = (
  project_slug: ProjectSlug,
  token_id: number | string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  return Token.findOne({ project_slug, token_id });
};

export const getTokenLean = (
  project_slug: ProjectSlug,
  token_id: number | string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.findOne({ project_slug, token_id });

  return query
    .select("-_id -__v -attributes._id -script_inputs._id")
    .lean()
    .exec();
};

export const getTokenAbbr = (
  project_slug: ProjectSlug,
  token_id: number | string,
  conn: Connection,
): Promise<TokenAbbr> => {
  const Token = conn.model<IToken>("Token");

  const query = Token.findOne({ project_slug, token_id });

  return query
    .select(
      "token_id name project_name project_slug artist image image_mid image_small thumbnail_url generator_url external_url script_inputs",
    )
    .lean()
    .exec() as Promise<TokenAbbr>;
};

export const getAllTokensFromProject = (
  project_slug: ProjectSlug,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.find({ project_slug });

  return query
    .select("-_id -__v -attributes._id -script_inputs._id")
    .lean()
    .exec();
};

export const getTokensTokenIdSort = (
  conn: Connection,
  project_slug: ProjectSlug,
  limit: number,
  skip: number,
  sort: "asc" | "desc",
): Promise<TokenAbbr[]> => {
  const Token = conn.model<IToken>("Token");

  const query = Token.find<TokenAbbr>({ project_slug })
    .sort({ token_id: sort === "asc" ? 1 : -1 })
    .limit(Number(limit))
    .skip(Number(skip))
    .select(
      "token_id name project_name project_slug artist image image_mid image_small thumbnail_url generator_url external_url script_inputs",
    );

  return query.lean().exec() as Promise<TokenAbbr[]>;
};

export const getTokensWorldLevelSort = (
  conn: Connection,
  project_slug: ProjectSlug,
  limit: number,
  skip: number,
  sort: "asc" | "desc",
): Promise<TokenAbbr[]> => {
  const Token = conn.model<IToken>("Token");

  const query = Token.aggregate<TokenAbbr>([
    {
      $match: {
        project_slug,
      },
    },
    {
      $project: {
        artist: true,
        external_url: true,
        generator_url: true,
        image: true,
        image_mid: true,
        image_small: true,
        name: true,
        project_name: true,
        project_slug: true,
        script_inputs: true,
        thumbnail_url: true,
        token_id: true,
        world_level: {
          $add: ["$script_inputs.transfer_count", "$script_inputs.level_shift"],
        },
      },
    },
    {
      $sort: {
        world_level: sort === "asc" ? 1 : -1,
      },
    },
    {
      $skip: Number(skip),
    },
    {
      $limit: Number(limit),
    },
  ]);

  return query.exec();
};

export const getScriptInputsFromDb = async (
  project_slug: ProjectSlug,
  token_id: number | string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.findOne({ project_slug, token_id });

  const result = await query.select("-script_inputs._id").lean().exec();

  return result?.script_inputs;
};

export const addToken = async (tokenToAdd: IToken, conn: Connection) => {
  const Token = conn.model<IToken>("Token");

  const newToken = new Token(tokenToAdd);

  const query = await newToken.save();

  return query;
};

export const addManyTokens = async (
  tokensToAdd: IToken[],
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const documents = await Token.create(tokensToAdd);

  const query = await Token.bulkSave(documents);

  return query;
};

export const getCurrentTokenSupply = async (
  project_id: number,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.find({ project_id });

  const tokens = await query.lean().exec();
  const tokensNoNull = tokens.filter(Boolean);

  const currentTokenSupply = tokensNoNull.length || 0;
  return currentTokenSupply;
};

export const getLevels = async (
  project_slug: ProjectSlug,
  conn: Connection,
): Promise<ILevel[]> => {
  const Token = conn.model<IToken>("Token");

  const query = Token.find({ project_slug });

  const results = await query
    .select("token_id script_inputs.transfer_count script_inputs.level_shift")
    .lean()
    .exec();

  const resParsed = results.map((token) => {
    const { script_inputs, token_id } = token;

    if (!script_inputs) return { level_shift: 0, token_id, transfer_count: 0 };

    const { level_shift, transfer_count } = script_inputs;

    return { level_shift: level_shift ?? 0, token_id, transfer_count };
  });

  resParsed.sort((a, b) => a.token_id - b.token_id);

  return resParsed;
};

export const updateTokenMetadataOnTransfer = async (
  project_id: number,
  token_id: number,
  script_inputs: IScriptInputs,
  image: string,
  image_mid: string,
  image_small: string,
  attributes: IAttribute[],
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.findOneAndUpdate(
    { project_id, token_id },
    { attributes, image, image_mid, image_small, script_inputs },
    { new: true },
  );

  const result = await query.lean().exec();

  return result;
};

export const removeDuplicateTokens = async (
  project_id: number,
  conn: Connection,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.aggregate([
    {
      $match: {
        project_id,
      },
    },
    {
      $group: {
        _id: "$token_id",
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
  ]);

  const duplicateTokens = await query.exec();

  const duplicateTokenIds = duplicateTokens.map((token) => token._id);
  const uniqueTokenIds = [...new Set(duplicateTokenIds)];

  await Promise.all(
    uniqueTokenIds.map(async (token_id) =>
      Token.findOneAndDelete({ project_id, token_id }),
    ),
  );
};

export const updateAllTokenDesc = async (
  conn: Connection,
  project_id: ProjectId,
  newDesc: string,
) => {
  const Token = conn.model<IToken>("Token");

  const query = Token.updateMany({ project_id }, { description: newDesc });

  const result = await query.exec();

  return result.modifiedCount;
};

export const updateOneTokenDesc = (
  conn: Connection,
  project_id: ProjectId,
  token_id: number | string,
  newDesc: string,
) => {
  const Token = conn.model<IToken>("Token");

  const filter = { project_id, token_id };
  const update = { description: newDesc };
  const options = { new: true };

  const query = Token.updateOne(filter, update, options);

  return query.exec();
};

export const updateScriptInputs = (
  conn: Connection,
  project_id: number,
  token_id: number,
  script_inputs: IScriptInputs,
) => {
  const Token = conn.model<IToken>("Token");

  const filter = { project_id, token_id };
  const update = { script_inputs };
  const options = { new: true };

  const query = Token.findOneAndUpdate(filter, update, options);

  return query.lean().exec();
};

export const getSvg = async (
  conn: Connection,
  project_slug: string,
  token_id: number,
) => {
  const Token = conn.model<IToken>("Token");

  const token = await Token.findOne({ project_slug, token_id });

  return token?.svg;
};
