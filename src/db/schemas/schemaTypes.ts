import { type ObjectId } from 'mongoose';
import { type Viewport } from 'puppeteer';
import type { ProjectSlug, ProjectId, Chain } from '../../projects';

export interface IRoyaltyInfo {
  royalty_fee_by_id: number;
  artist_address?: string;
  charity_address?: string;
  additional_payee?: string;
  additional_payee_bps?: number;
}

export interface GenScripts {
  main?: string;
  alt?: string;
  world?: string;
  painting?: string;
  mobileControls?: string;
  preMainScript?: string;
}

export interface IDevParams {
  useInDev: boolean;
  useInProd: boolean;
  isBulkMint: boolean;
  usesPuppeteer: boolean;
  usesScriptInputs: boolean;
  usesSvgs: boolean;
}

export interface IProject {
  _id: ProjectId;
  project_name: string;
  project_slug: ProjectSlug;
  artist: string;
  artist_address: string;
  royalty_info: IRoyaltyInfo;
  description?: string;
  appended_description?: string;
  maximum_supply: number;
  starting_index: number;
  current_supply?: number;
  tx_count: number;
  collection_name: string;
  collection_image?: string;
  collection_description: string;
  mintable: boolean;
  script_type?: string;
  aspect_ratio: number;
  website: string;
  external_url: string;
  license: string;
  contract_address: string;
  chain: Chain;
  events: string[];
  creation_block: number;
  gen_scripts?: GenScripts;
  devParams: IDevParams;
  [key: string]: any; // for future proofing ???
}

export interface IAttribute {
  trait_type: string;
  value: string | number;
}

export interface IScriptInputs {
  token_id?: number;
  transfer_count?: number;
  token_entropy?: string;
  current_owner?: string;
  previous_owner?: string;
  custom_rule?: string;
  custom_data?: string;
  level_shift?: number;
  imageURI_base?: string;
  audioURI_base?: string;
  media_URI?: string;
  approved_shuffler?: `0x${string}`;
  svg_part?: string;
  svg_parts?: string;
  title?: string;
  description?: string;
}

export interface IToken {
  _id?: ObjectId; // made by db
  token_id: number; // get from blockchain
  name: string; // projectname + tokenId 'Chainlife 9'
  project_id: number; // project
  project_name: string; // project
  project_slug: ProjectSlug; // project
  artist: string; // project
  artist_address: string; // project
  description: string; // project
  collection_name: string; // project
  aspect_ratio: number; // project
  script_type?: string; // project
  script_inputs?: IScriptInputs;
  image: string; // generation scripts
  image_mid?: string;
  image_small?: string;
  thumbnail_url?: string;
  svg?: string;
  svgGen?: string;
  image_data?: string; // not used for Chainlife
  animation_url?: string; // generation script
  generator_url?: string; // same as animation_url
  generator_mobile?: string;
  generator_alt?: string;
  website: string; // project
  external_url: string; // project
  license: string; // project*
  royalty_info: IRoyaltyInfo; // project
  attributes: IAttribute[]; // script
}

export interface ITransaction {
  _id?: ObjectId;
  project_id: ProjectId;
  block_number: number;
  transaction_hash: string;
  transaction_date: Date;
  event_type: string;
  token_id?: number;
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

export interface ILevel {
  token_id: number;
  transfer_count: number | undefined;
  level_shift: number;
}

export interface ILevelSnapshot {
  _id?: ObjectId;
  snapshot_date: Date;
  project_slug: ProjectSlug;
  levels: ILevel[];
}

export interface TokenAbbr {
  token_id: number;
  name: string;
  project_name: string;
  project_slug: ProjectSlug;
  artist: string;
  image: string;
  image_mid?: string;
  image_small?: string;
  thumbnail_url: string;
  generator_url: string;
  svgGen?: string;
  external_url: string;
  script_inputs?: IScriptInputs;
  world_level?: number;
}

export interface CollectionResponse {
  hasMore: boolean;
  skip: number;
  currentSupply: number;
  tokens: TokenAbbr[];
}

export type ProjectSizes = {
  [key in ProjectId]: {
    full: Viewport;
    mid: Viewport;
    small: Viewport;
    thumb?: Viewport;
  };
};
