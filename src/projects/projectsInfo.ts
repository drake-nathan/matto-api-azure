import { AbiItem } from 'web3-utils';
import { IProject } from '../db/schemas/schemaTypes';
import chainlifeAbi from './abis/chainlife.abi.json';

enum projectIds {
  chainlifeTestnet,
  chainlifeMainnet,
  '100x10x1a',
}

export const projects: IProject[] = [
  {
    _id: projectIds.chainlifeTestnet,
    project_name: 'Chainlife Testnet',
    project_slug: 'chainlife-testnet',
    artist: 'Matto',
    artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
    royalty_info: {
      artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
      royalty_fee_by_id: 5,
    },
    description:
      'Chainlife is an on-chain generative art-mimics-life-mimics-art collectible and evolving game. (Click to start, press h for help)',
    maximum_supply: 4096,
    collection_name: 'Chainlife',
    collection_image: 'chain.jpegs',
    collection_description:
      'Chainlife is an on-chain generative art-mimics-life-mimics-art collectible and evolving game within a game.',
    mintable: true,
    script_type: 'p5.js',
    website: 'https://matto.xyz/',
    external_url: 'https://matto.xyz/project/chainlife',
    license: 'CC BY-NC 4.0',
    contract_address: '0x04c9E99D134565eB0F0Fef07FB70741A5b615075',
    events: ['Transfer', 'CustomRule', 'ShiftLevel'],
    creation_block: 7729596,
  },
  // {
  //   _id: projectIds.chainlifeMainnet,
  //   project_name: 'Chainlife',
  //   project_slug: 'chainlife',
  //   artist: 'Matto',
  //   artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //   royalty_info: {
  //     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //     royalty_fee_by_id: 5,
  //   },
  //   description:
  //     'Chainlife is an on-chain generative art-mimics-life-mimics-art collectible and evolving game. (Click to start, press h for help)',
  //   maximum_supply: 4096,
  //   collection_name: 'Chainlife',
  //   collection_image: 'chain.jpegs',
  //   collection_description:
  //     'Chainlife is an on-chain generative art-mimics-life-mimics-art collectible and evolving game within a game.',
  //   mintable: true,
  //   script_type: 'p5.js',
  //   website: 'https://matto.xyz/',
  //   external_url: 'https://matto.xyz/project/chainlife',
  //   license: 'CC BY-NC 4.0',
  //   contract_address: '0x04c9E99D134565eB0F0Fef07FB70741A5b615075',
  //   events: ['Transfer', 'CustomRule', 'ShiftLevel'],
  //   creation_block: 7729596,
  // },
  // {
  //   _id: projectIds['100x10x1a'],
  //   project_name: '100X10X1-A',
  //   project_slug: '100x10x1a',
  //   artist: 'Matto',
  //   artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //   royalty_info: {
  //     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //     royalty_fee_by_id: 5,
  //   },
  //   description: '100x10x1-A is an experiment.',
  //   maximum_supply: 101,
  //   collection_name: '100x10x1-A',
  //   collection_image: 'XA.jpegs',
  //   collection_description: '100x10x1-A is an experiment.',
  //   mintable: false,
  //   script_type: 'Solidity + JavaScript',
  //   website: 'https://matto.xyz/',
  //   external_url: 'https://matto.xyz/project/100x10x1a',
  //   license: 'CC BY-NC 4.0',
  //   contract_address: '0x41c3d1b1eca23852b50ee6563da4afdf7e1a4c08',
  //   events: ['Topped', 'Reversed', 'NewOrder'],
  //   creation_block: 7554994,
  // },
];

export const abis = {
  [projects[projectIds.chainlifeTestnet]._id]: chainlifeAbi as AbiItem[],
};
