import { AbiItem } from 'web3-utils';
import { Chain, IProject, ProjectId } from '../db/schemas/schemaTypes';
import chainlifeGoerliAbi from './abis/chainlife.abi.json';

export const projects: IProject[] = [
  {
    _id: ProjectId.chainlifeTestnet,
    project_name: 'Chainlife Testnet',
    project_slug: 'chainlife-testnet',
    artist: 'Matto',
    artist_address: '0x318c7370927287a7d03fa659848C25db88213DbA',
    royalty_info: {
      artist_address: '0x318c7370927287a7d03fa659848C25db88213DbA',
      royalty_fee_by_id: 7,
    },
    description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\n---**Interactivity:** Chainlife tokens are self-contained applications that have many controls. Here are a basic instructions to get started:\n\n- Click, press, or use the spacebar to start or pause a simulation.\n\n- Use keys 1-5 to change the speed.\n\n- Use keys 6-0 to change the rulesets (these unlock as the token gains levels).\n\n- Use 'Z' to reset the starting population, or refresh the page to entirely restart the simulation.\n\n- For additional help, use 'H'.\n\n- For in-depth instructions, view the documentation, linked from [chainlife.xyz](https://chainlife.xyz/).",
    maximum_supply: 4096,
    collection_name: 'Chainlife',
    collection_image: 'https://media.matto.xyz/gengames/chainlife_multicolor.png',
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    mintable: true,
    script_type: 'p5.js',
    website: 'https://matto.xyz/project/chainlife',
    external_url: 'https://chainlife.xyz',
    license: 'CC BY-NC 4.0',
    contract_address: '0x04c9E99D134565eB0F0Fef07FB70741A5b615075',
    chain: Chain.goerli,
    events: ['Transfer', 'CustomRule', 'ShiftLevel'],
    creation_block: 7729596,
  },
  // {
  //   _id: ProjectId.chainlifeMainnet,
  //   project_name: 'Chainlife',
  //   project_slug: 'chainlife',
  //   artist: 'Matto',
  //   artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
  //   royalty_info: {
  //     artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
  //     royalty_fee_by_id: 7,
  //   },
  //   description:
  //     "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\n---**Interactivity:** Chainlife tokens are self-contained applications that have many controls. Here are a basic instructions to get started:\n\n- Click, press, or use the spacebar to start or pause a simulation.\n\n- Use keys 1-5 to change the speed.\n\n- Use keys 6-0 to change the rulesets (these unlock as the token gains levels).\n\n- Use 'Z' to reset the starting population, or refresh the page to entirely restart the simulation.\n\n- For additional help, use 'H'.\n\n- For in-depth instructions, view the documentation, linked from [chainlife.xyz](https://chainlife.xyz/).",
  //   maximum_supply: 4096,
  //   collection_name: 'Chainlife',
  //   collection_image: 'https://media.matto.xyz/gengames/chainlife_multicolor.png',
  //   collection_description:
  //     "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
  //   mintable: true,
  //   script_type: 'p5.js',
  //   website: 'https://matto.xyz/project/chainlife',
  //   external_url: 'https://chainlife.xyz',
  //   license: 'CC BY-NC 4.0',
  //   contract_address: '0x04c9E99D134565eB0F0Fef07FB70741A5b615075',
  //   chain: Chain.mainnet,
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
  [projects[ProjectId.chainlifeTestnet]._id]: chainlifeGoerliAbi as AbiItem[],
};
