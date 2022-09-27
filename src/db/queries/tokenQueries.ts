import { IToken, IScriptInputs, IAttribute } from '../models/modelTypes';
import { Token } from '../models/token';

export const checkIfTokenExists = async (token_id: number) => {
  const query = await Token.exists({ token_id });
  return query;
};

// get data for script
export const getToken = (project_slug: string, token_id: string) => {
  const query = Token.findOne({ project_slug, token_id });

  query.select('-_id -__v -attributes._id -script_inputs._id');

  return query.lean().exec();
};

export const addToken = async (tokenToAdd: IToken) => {
  const newToken = new Token(tokenToAdd);

  const query = await newToken.save();

  return query;
};

export const getCurrentTokenSupply = async (project_id: number) => {
  const query = Token.find({ project_id });

  const tokens = await query.lean().exec();
  const tokensNoNull = tokens.filter(Boolean);

  const currentTokenSupply = tokensNoNull?.length || 0;
  return currentTokenSupply;
};

export const updateTokenMetadataOnTransfer = async (
  project_id: number,
  token_id: number,
  script_inputs: IScriptInputs,
  attributes: IAttribute[],
) => {
  await Token.findOneAndUpdate({ project_id, token_id }, { script_inputs, attributes });
};

export const removeDuplicateTokens = async (project_id: number) => {
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
