import { type Connection } from 'mongoose';
import {
  type IToken,
  type IScriptInputs,
  type IAttribute,
  type TokenAbbr,
  ProjectId,
  type ILevel,
} from '../schemas/schemaTypes';

export const checkIfTokenExists = async (
  token_id: number,
  project_slug: string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>('Token');

  const query = await Token.exists({ token_id, project_slug });
  return query;
};

export const getToken = (
  project_slug: string,
  token_id: string | number,
  conn: Connection,
) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.findOne({ project_slug, token_id });

  query.select('-_id -__v -attributes._id -script_inputs._id');

  return query.lean().exec();
};

export const getTokenAbbr = (
  project_slug: string,
  token_id: string | number,
  conn: Connection,
): Promise<TokenAbbr> => {
  const Token = conn.model<IToken>('Token');

  const query = Token.findOne({ project_slug, token_id });

  query.select(
    'token_id name project_name project_slug artist image image_mid thumbnail_url generator_url external_url script_inputs',
  );

  return query.lean().exec() as Promise<TokenAbbr>;
};

export const getAllTokensFromProject = (project_slug: string, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.find({ project_slug });

  query.select('-_id -__v -attributes._id -script_inputs._id');

  return query.lean().exec();
};

export const getTokensTokenIdSort = (
  conn: Connection,
  project_slug: string,
  limit: number,
  skip: number,
  sort: 'asc' | 'desc',
): Promise<TokenAbbr[]> => {
  const Token = conn.model<IToken>('Token');

  const query = Token.find<TokenAbbr>({ project_slug })
    .sort({ token_id: sort === 'asc' ? 1 : -1 })
    .limit(Number(limit))
    .skip(Number(skip))
    .select(
      'token_id name project_name project_slug artist image image_mid thumbnail_url generator_url external_url script_inputs',
    );

  return query.lean().exec() as Promise<TokenAbbr[]>;
};

export const getTokensWorldLevelSort = (
  conn: Connection,
  project_slug: string,
  limit: number,
  skip: number,
  sort: 'asc' | 'desc',
): Promise<TokenAbbr[]> => {
  const Token = conn.model<IToken>('Token');

  const query = Token.aggregate<TokenAbbr>([
    {
      $match: {
        project_slug,
      },
    },
    {
      $project: {
        token_id: true,
        name: true,
        project_name: true,
        project_slug: true,
        artist: true,
        image: true,
        image_mid: true,
        thumbnail_url: true,
        generator_url: true,
        external_url: true,
        script_inputs: true,
        world_level: {
          $add: ['$script_inputs.transfer_count', '$script_inputs.level_shift'],
        },
      },
    },
    {
      $sort: {
        world_level: sort === 'asc' ? 1 : -1,
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
  project_slug: string,
  token_id: string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.findOne({ project_slug, token_id });

  query.select('-script_inputs._id');

  const result = await query.lean().exec();

  return result?.script_inputs;
};

export const addToken = async (tokenToAdd: IToken, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const newToken = new Token(tokenToAdd);

  const query = await newToken.save();

  return query;
};

export const getCurrentTokenSupply = async (project_id: number, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.find({ project_id });

  const tokens = await query.lean().exec();
  const tokensNoNull = tokens.filter(Boolean);

  const currentTokenSupply = tokensNoNull?.length || 0;
  return currentTokenSupply;
};

export const getLevels = async (
  project_slug: string,
  conn: Connection,
): Promise<ILevel[]> => {
  const Token = conn.model<IToken>('Token');

  const query = Token.find({ project_slug });

  query.select('token_id script_inputs.transfer_count script_inputs.level_shift');

  const results = await query.lean().exec();

  const resParsed = results.map((token) => {
    const {
      token_id,
      script_inputs: { transfer_count },
      script_inputs: { level_shift },
    } = token;

    return { token_id, transfer_count, level_shift: level_shift || 0 };
  });

  resParsed.sort((a, b) => a.token_id - b.token_id);

  return resParsed;
};

export const updateTokenMetadataOnTransfer = async (
  project_id: number,
  token_id: number,
  script_inputs: IScriptInputs,
  image: string,
  thumbnail_url: string | undefined,
  attributes: IAttribute[],
  conn: Connection,
) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.findOneAndUpdate(
    { project_id, token_id },
    { script_inputs, image, thumbnail_url, attributes },
    { new: true },
  );

  const result = await query.lean().exec();

  return result;
};

export const removeDuplicateTokens = async (project_id: number, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.aggregate([
    {
      $match: {
        project_id,
      },
    },
    {
      $group: {
        _id: '$token_id',
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
    uniqueTokenIds.map(async (token_id) => {
      Token.findOneAndDelete({ project_id, token_id });
    }),
  );
};

export const updateAllTokenDesc = async (
  conn: Connection,
  project_id: ProjectId,
  newDesc: string,
) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.updateMany({ project_id }, { description: newDesc });

  const result = await query.exec();

  return result.modifiedCount;
};

export const updateOneTokenDesc = (
  conn: Connection,
  project_id: ProjectId,
  token_id: string | number,
  newDesc: string,
) => {
  const Token = conn.model<IToken>('Token');

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
  const Token = conn.model<IToken>('Token');

  const filter = { project_id, token_id };
  const update = { script_inputs };
  const options = { new: true };

  const query = Token.findOneAndUpdate(filter, update, options);

  return query.lean().exec();
};
