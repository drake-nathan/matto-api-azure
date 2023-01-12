import { type AbiItem } from 'web3-utils';
import type { IProject, ProjectSizes } from '../db/schemas/schemaTypes';
import chainlifeGoerliAbi from './abis/ChainlifeGoerli.abi.json';
import chainlifeMainnetAbi from './abis/ChainlifeMainnet.abi.json';
import mathareAbi from './abis/Mathare.abi.json';
import negativeCarbonAbi from './abis/NegativeCarbon.abi.json';
import crystallizedIllusionsAbi from './abis/CrystallizedIllusions.abi.json';

export enum Chain {
  mainnet = 'mainnet',
  goerli = 'goerli',
}
export enum ProjectId {
  chainlifeTestnet,
  chainlifeMainnet,
  mathare,
  negativeCarbon,
  crystallizedIllusions,
}

export enum ProjectSlug {
  chainlifeTestnet = 'chainlife-testnet',
  chainlifeMainnet = 'chainlife',
  mathare = 'mathare',
  negativeCarbon = 'negative-carbon',
  crystallizedIllusions = 'crystallized-illusions',
}

export const projects: IProject[] = [
  {
    _id: ProjectId.chainlifeTestnet,
    project_name: 'Chainlife Testnet',
    project_slug: ProjectSlug.chainlifeTestnet,
    artist: 'Matto',
    artist_address: '0x318c7370927287a7d03fa659848C25db88213DbA',
    royalty_info: {
      artist_address: '0x318c7370927287a7d03fa659848C25db88213DbA',
      royalty_fee_by_id: 7,
    },
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    maximum_supply: 4096,
    starting_index: 0,
    tx_count: 0,
    collection_name: 'Chainlife',
    collection_image: 'https://media.matto.xyz/gengames/chainlife_multicolor.png',
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    mintable: true,
    script_type: 'p5.js',
    aspect_ratio: 1,
    website: 'https://matto.xyz/project/chainlife',
    external_url: 'https://chainlife.xyz',
    license: 'CC BY-NC 4.0',
    contract_address: '0x04c9E99D134565eB0F0Fef07FB70741A5b615075',
    chain: Chain.goerli,
    events: ['Transfer', 'CustomRule', 'ShiftLevel'],
    creation_block: 7729596,
    gen_scripts: {
      main: 'https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js',
      alt: 'https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js',
      mobileControls:
        'https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js',
      world: 'https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js',
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
    },
  },
  {
    _id: ProjectId.chainlifeMainnet,
    project_name: 'Chainlife',
    project_slug: ProjectSlug.chainlifeMainnet,
    artist: 'Matto',
    artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
    royalty_info: {
      artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
      royalty_fee_by_id: 7,
    },
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    maximum_supply: 4096,
    starting_index: 0,
    tx_count: 0,
    collection_name: 'Chainlife',
    collection_image: 'https://media.matto.xyz/gengames/chainlife_multicolor.png',
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** an ever-changing macrocosm that is controlled by you, that is collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's blockchain interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    mintable: true,
    script_type: 'p5.js',
    aspect_ratio: 1,
    website: 'https://matto.xyz/project/chainlife',
    external_url: 'https://chainlife.xyz',
    license: 'CC BY-NC 4.0',
    contract_address: '0x4E171e0F14a9046e14B93221f31Acd2EC4Af8429',
    chain: Chain.mainnet,
    events: ['Transfer', 'CustomRule', 'ShiftLevel'],
    creation_block: 15908912,
    gen_scripts: {
      main: 'https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js',
      alt: 'https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js',
      mobileControls:
        'https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js',
      world: 'https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js',
    },
    devParams: {
      useInDev: false,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
    },
  },
  {
    _id: ProjectId.mathare,
    chain: Chain.mainnet,
    project_name: 'Mathare Memories',
    project_slug: ProjectSlug.mathare,
    artist: 'Matto',
    artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
    collection_name: 'Mathare Memories',
    royalty_info: {
      charity_address: '0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806',
      royalty_fee_by_id: 10,
    },
    maximum_supply: 68,
    current_supply: 68,
    starting_index: 1,
    tx_count: 0,
    collection_image:
      'https://o3irvsyqapmasj3xza6fs3eevrc7p3shvqyrwcmfxiu4anqpqxna.arweave.net/dtEayxAD2Aknd8g8WWyErEX37kesMRsJhbopwDYPhdo/1.png',
    collection_description:
      "Mathare Memories is an interactive, multimedia collection of 68 photographs taken in the Mathare slum of Nairobi, Kenya in 2007. High resolution images and audio files are permanently stored on Arweave, are backed up on Github, and are retrieved for display by on-chain JavaScript running in your browser.\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.\n\nProceeds and Royalties:\n\n100% of all artist proceeds are being transparently directed to charity. 100% of all 'creator' secondary fees are being transparently directed to charity. Matto and substratum.art (the platform that powers this multimedia collection) receive no compensation for this project.\n\nAs a 100% charity project, 10% royalties are expected to be paid on all sales and should be sent to the collection's smart contract address.\n\nOn-Chain Metadata:\n\nLike all substratum.art projects, all metadata is stored on-chain. Like all substratum.art projects that use JavaScript, ARIA descriptions are included in the live generator's HTML to enhance the experience of audiences with visual impairment.",
    appended_description:
      "\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.",
    mintable: false,
    script_type: 'p5.js',
    aspect_ratio: 1,
    website: 'https://substratum.art/project/mathare-memories',
    external_url: 'https://substratum.art/project/mathare-memories',
    license: 'All Rights Reserved',
    contract_address: '0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806',
    events: ['Transfer'],
    creation_block: 16215143,
    gen_scripts: {
      main: 'https://cdn.substratum.art/scripts/mathare/mathareMemories.min.js',
      preMainScript: 'https://cdn.substratum.art/scripts/mathare/descriptions.min.js',
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: true,
    },
  },
  {
    _id: ProjectId.negativeCarbon,
    chain: Chain.mainnet,
    project_name: 'Negative Carbon',
    project_slug: ProjectSlug.negativeCarbon,
    artist: 'Immutable Computer',
    artist_address: '0x18120f6064de06afb42bc89a980c4d80267683ac',
    collection_name: 'Negative Carbon NFT',
    royalty_info: {
      artist_address: '0xa9132D23886b63D29858Fe541214fEad5815d64A',
      royalty_fee_by_id: 7,
    },
    maximum_supply: 128,
    current_supply: 1,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "Each Negative Carbon NFT (NCNFT) offsets more than its carbon footprint using rigorously validated, third-party audited, retired, carbon offsets. Each token is assigned an offset certificate and mint, and that certificate's serial number becomes the token's generative art's entropy. For more information, visit http://immutablecomputer.com/carbon.html.",
    mintable: false,
    script_type: 'p5.js',
    aspect_ratio: 1.77,
    website: 'http://immutablecomputer.com/carbon.html',
    external_url: 'https://www.substratum.art/project/negative-carbon',
    license: 'All Rights Reserved',
    contract_address: '0xa9132D23886b63D29858Fe541214fEad5815d64A',
    events: ['Transfer', 'TokenUpdated'],
    creation_block: 16312447,
    gen_scripts: {
      main: 'https://cdn.substratum.art/scripts/negativeCarbon/negativeCarbon.min.js',
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
    },
  },
  // {
  //   _id: ProjectId.crystallizedIllusions,
  //   chain: Chain.mainnet,
  //   project_name: 'Crystallized Illusions',
  //   project_slug: 'crystallized-illusions',
  //   artist: 'Matto',
  //   artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //   collection_name: 'Crystallized Illusions',
  //   royalty_info: {
  //     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  //     royalty_fee_by_id: 10,
  //   },
  //   maximum_supply: 99,
  //   current_supply: 99,
  //   starting_index: 0,
  //   tx_count: 0,
  //   collection_description:
  //     "Inspired by Buddhist philosophy, Crystallized Illusions is a collection of 99 pieces created through a generative process. Three variations of this process were made to correspond to the categories of illusions as described by Zhiyi (538-597 CE), the fourth patriarch of the T'ien-t'ai (or Tí Taî) Buddhist tradition. Each process was used to created 33 distinct images.",
  //   mintable: false,
  //   script_type: 'p5',
  //   aspect_ratio: 1,
  //   website: 'https://matto.xyz/project/crystallized-illusions/',
  //   external_url: 'https://www.substratum.art/project/crystallized-illusions',
  //   license: 'All Rights Reserved',
  //   contract_address: '0x5B17395A9699D2819a9d009bA375a0825b077385',
  //   events: [],
  //   creation_block: 16313758,
  //   gen_scripts: {
  //     main: 'https://cdn.substratum.art/scripts/crystallizedIllusions/crystallizedIllusions.min.js',
  //   },
  //   devParams: {
  //     useInDev: true,
  //     useInProd: true,
  //     usesPuppeteer: false,
  //     isBulkMint: true,
  //   },
  // },
];

export const abis = {
  [projects[ProjectId.chainlifeTestnet]._id]: chainlifeGoerliAbi as AbiItem[],
  [projects[ProjectId.chainlifeMainnet]._id]: chainlifeMainnetAbi as AbiItem[],
  [projects[ProjectId.mathare]._id]: mathareAbi as AbiItem[],
  [projects[ProjectId.negativeCarbon]._id]: negativeCarbonAbi as AbiItem[],
  // [projects[ProjectId.crystallizedIllusions]._id]: crystallizedIllusionsAbi as AbiItem[],
};

// only matters for puppeteer
export const projectSizes: ProjectSizes = {
  [ProjectId.chainlifeTestnet]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    thumb: { width: 300, height: 300 },
  },
  [ProjectId.chainlifeMainnet]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    thumb: { width: 300, height: 300 },
  },
  [ProjectId.mathare]: null,
  [ProjectId.negativeCarbon]: {
    full: { width: 3840, height: 2160 },
    mid: { width: 1920, height: 1080 },
    thumb: { width: 540, height: 304 },
  },
  [ProjectId.crystallizedIllusions]: null,
};
