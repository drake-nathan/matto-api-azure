import { Connection } from 'mongoose';
import { IToken, IScriptInputs, IAttribute } from '../schemas/schemaTypes';

export const checkIfTokenExists = async (
  token_id: number,
  project_slug: string,
  conn: Connection,
) => {
  const Token = conn.model<IToken>('Token');

  const query = await Token.exists({ token_id, project_slug });
  return query;
};

// get data for script
export const getToken = (project_slug: string, token_id: string, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.findOne({ project_slug, token_id });

  query.select('-_id -__v -attributes._id -script_inputs._id');

  return query.lean().exec();
};

export const getAllTokensFromProject = (project_slug: string, conn: Connection) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.find({ project_slug });

  return query.lean().exec();
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

export const getLevels = async (project_slug: string, conn: Connection) => {
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

    return { token_id, transfer_count, level_shift };
  });

  resParsed.sort((a, b) => a.token_id - b.token_id);

  return resParsed;
};

export const updateTokenMetadataOnTransfer = async (
  project_id: number,
  token_id: number,
  script_inputs: IScriptInputs,
  image: string,
  thumbnail_url: string,
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

export const updateTokenDesc = async (conn: Connection, newDesc: string) => {
  const Token = conn.model<IToken>('Token');

  const query = Token.updateMany({}, { description: newDesc });

  const result = await query.exec();

  return result.modifiedCount;
};
