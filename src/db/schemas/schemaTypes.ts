import { ObjectId } from 'mongoose';

export enum ProjectId {
  chainlifeTestnet,
  chainlifeMainnet,
  '100x10x1a',
}

export enum Chain {
  mainnet = 'mainnet',
  goerli = 'goerli',
}

export interface IRoyaltyInfo {
  artist_address: string;
  additional_payee?: string;
  additional_payee_bps?: number;
  royalty_fee_by_id: number;
}

export interface IProject {
  _id: ProjectId;
  project_name: string;
  project_slug: string;
  artist: string;
  artist_address: string; // also RoyaltyInfo
  royalty_info: IRoyaltyInfo;
  description: string;
  maximum_supply: number;
  current_supply?: number;
  collection_name: string;
  collection_image: string;
  collection_description: string;
  mintable: boolean;
  script_type: string;
  website: string;
  external_url: string;
  license: string;
  contract_address: string;
  chain: Chain;
  events: string[];
  creation_block: number;
}

export interface IAttribute {
  trait_type: string;
  value: string | number;
}

export interface IScriptInputs {
  token_id: number;
  token_entropy: string;
  current_owner: string;
  previous_owner: string;
  transfer_count: number;
  custom_rule: string;
  level_shift: number;
}

export interface IToken {
  _id?: ObjectId; // made by db
  token_id: number; // get from blockchain
  name: string; // projectname + tokenId 'Chainlife 9'
  project_id: number; // project
  project_name: string; // project
  project_slug: string; // project
  artist: string; // project
  artist_address: string; // project
  description: string; // project
  collection_name: string; // project
  aspect_ratio: number;
  script_type: string;
  script_inputs: IScriptInputs;
  image: string; // generation scripts
  image_data?: string; // not used for Chainlife
  animation_url: string; // generation script
  generator_url: string; // same as animation_url
  website: string; // project
  external_url: string; // project
  license: string; // project*
  royalty_info: IRoyaltyInfo; // project
  attributes: IAttribute[]; // script
}

export interface ITransaction {
  _id?: ObjectId;
  project_id: number;
  block_number: number;
  transaction_hash: string;
  transaction_date: Date;
  event_type: string;
  token_id: number;
}

export interface IThumbnail {
  _id?: ObjectId;
  project_slug: 'focus' | 'enso';
  project_id: 34 | 181;
  token_id: number;
  artblocks_id: string;
  image_full: string;
  image_thumbnail: string;
}
