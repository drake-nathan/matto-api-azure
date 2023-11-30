import { type AbiItem } from "web3-utils";

import type { IProject, ProjectSizes } from "../db/schemas/schemaTypes";
import oneHundredxAbi from "./100x10x1x/abi/100x10x1.abi.json";
import blonksAbi from "./abis/BLONKS.abi.json";
// abi's
import chainlifeGoerliAbi from "./abis/ChainlifeGoerli.abi.json";
import chainlifeMainnetAbi from "./abis/ChainlifeMainnet.abi.json";
import crystallizedIllusionsAbi from "./abis/CrystallizedIllusions.abi.json";
import mathareAbi from "./abis/Mathare.abi.json";
import negativeCarbonAbi from "./abis/NegativeCarbon.abi.json";
import textureAndHuesAbi from "./abis/TextureAndHues.abi.json";
import haikuAbi from "./haiku/abi/haiku.abi.json";
import mfaAbi from "./mfa/abi/mfa.abi.json";

export enum Chain {
  mainnet = "mainnet",
  goerli = "goerli",
}

/**
 * ProjectId is used to identify the project in the database.
 *
 * 0 = Chainlife Testnet
 * 1 = Chainlife Mainnet
 * 2 = Mathare
 * 3 = Negative Carbon
 * 4 = Crystallized Illusions
 * 5 = Texture and Hues
 * 6 = BLONKS
 * 7 = 100x10x1 Goerli
 * 8 = haiku
 * 9 = MFA
 */
export enum ProjectId {
  chainlifeTestnet,
  chainlifeMainnet,
  mathareMemories,
  negativeCarbon,
  crystallizedIllusions,
  textureAndHues,
  blonks,
  "100x10x1-a-goerli",
  haiku,
  mfa,
}

/**
 * ProjectSlug is used to identify the project in the API.
 *
 * chainlife-testnet = Chainlife Testnet
 * chainlife = Chainlife Mainnet
 * mathare-memories = Mathare
 * negative-carbon = Negative Carbon
 * crystallized-illusions = Crystallized Illusions
 * texture-and-hues = Texture and Hues
 * blonks = BLONKS
 * 100x10x1-a-goerli = 100x10x1-a Goerli
 * haiku
 * mfa
 */
export enum ProjectSlug {
  chainlifeTestnet = "chainlife-testnet",
  chainlifeMainnet = "chainlife",
  mathareMemories = "mathare-memories",
  negativeCarbon = "negative-carbon",
  crystallizedIllusions = "crystallized-illusions",
  textureAndHues = "texture-and-hues",
  blonks = "blonks",
  "100x10x1-a-goerli" = "100x10x1-a-goerli",
  haiku = "haiku",
  mfa = "mfa",
}

export const projects: IProject[] = [
  {
    _id: ProjectId.chainlifeTestnet,
    project_name: "Chainlife Testnet",
    project_slug: ProjectSlug.chainlifeTestnet,
    artist: "Matto",
    artist_address: "0x318c7370927287a7d03fa659848C25db88213DbA",
    royalty_info: {
      artist_address: "0x318c7370927287a7d03fa659848C25db88213DbA",
      royalty_fee_by_id: 7,
    },
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    maximum_supply: 4096,
    starting_index: 0,
    tx_count: 0,
    collection_name: "Chainlife",
    collection_image:
      "https://media.matto.xyz/gengames/chainlife_multicolor.png",
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    mintable: true,
    script_type: "p5.js",
    aspect_ratio: 1,
    website: "https://matto.xyz/project/chainlife",
    external_url: "https://chainlife.xyz",
    license: "CC BY-NC 4.0",
    contract_address: "0x04c9E99D134565eB0F0Fef07FB70741A5b615075",
    chain: Chain.goerli,
    events: ["Transfer", "CustomRule", "ShiftLevel"],
    creation_block: 7729596,
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js",
      alt: "https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js",
      painting:
        "https://cdn.substratum.art/scripts/chainlife/chainlifePainting.min.js",
      mobileControls:
        "https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js",
      world:
        "https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js",
    },
    devParams: {
      useInDev: false,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
      usesScriptInputs: true,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.chainlifeMainnet,
    project_name: "Chainlife",
    project_slug: ProjectSlug.chainlifeMainnet,
    artist: "Matto",
    artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
    royalty_info: {
      artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
      royalty_fee_by_id: 7,
    },
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    maximum_supply: 4096,
    starting_index: 0,
    tx_count: 0,
    collection_name: "Chainlife",
    collection_image:
      "https://media.matto.xyz/gengames/chainlife_multicolor.png",
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** an ever-changing macrocosm that is controlled by you, that is collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's blockchain interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    mintable: true,
    script_type: "p5.js",
    aspect_ratio: 1,
    website: "https://matto.xyz/project/chainlife",
    external_url: "https://chainlife.xyz",
    license: "CC BY-NC 4.0",
    contract_address: "0x4E171e0F14a9046e14B93221f31Acd2EC4Af8429",
    chain: Chain.mainnet,
    events: ["Transfer", "CustomRule", "ShiftLevel"],
    creation_block: 15908912,
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js",
      alt: "https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js",
      mobileControls:
        "https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js",
      world:
        "https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js",
      painting:
        "https://cdn.substratum.art/scripts/chainlife/chainlifePainting.min.js",
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
      usesScriptInputs: true,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.mathareMemories,
    chain: Chain.mainnet,
    project_name: "Mathare Memories",
    project_slug: ProjectSlug.mathareMemories,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    collection_name: "Mathare Memories",
    royalty_info: {
      charity_address: "0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806",
      royalty_fee_by_id: 10,
    },
    maximum_supply: 68,
    starting_index: 1,
    tx_count: 0,
    collection_image:
      "https://o3irvsyqapmasj3xza6fs3eevrc7p3shvqyrwcmfxiu4anqpqxna.arweave.net/dtEayxAD2Aknd8g8WWyErEX37kesMRsJhbopwDYPhdo/1.png",
    collection_description:
      "Mathare Memories is an interactive, multimedia collection of 68 photographs taken in the Mathare slum of Nairobi, Kenya in 2007. High resolution images and audio files are permanently stored on Arweave, are backed up on Github, and are retrieved for display by on-chain JavaScript running in your browser.\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.\n\nProceeds and Royalties:\n\n100% of all artist proceeds are being transparently directed to charity. 100% of all 'creator' secondary fees are being transparently directed to charity. Matto and substratum.art (the platform that powers this multimedia collection) receive no compensation for this project.\n\nAs a 100% charity project, 10% royalties are expected to be paid on all sales and should be sent to the collection's smart contract address.\n\nOn-Chain Metadata:\n\nLike all substratum.art projects, all metadata is stored on-chain. Like all substratum.art projects that use JavaScript, ARIA descriptions are included in the live generator's HTML to enhance the experience of audiences with visual impairment.",
    appended_description:
      "\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.",
    mintable: false,
    script_type: "p5.js",
    aspect_ratio: 1,
    website: "https://substratum.art/project/mathare-memories",
    external_url: "https://substratum.art/project/mathare-memories",
    license: "All Rights Reserved",
    contract_address: "0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806",
    events: ["Transfer"],
    creation_block: 16215143,
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/mathare/mathareMemories.min.js",
      preMainScript:
        "https://cdn.substratum.art/scripts/mathare/descriptions.min.js",
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.negativeCarbon,
    chain: Chain.mainnet,
    project_name: "Negative Carbon",
    project_slug: ProjectSlug.negativeCarbon,
    artist: "Immutable Computer",
    artist_address: "0x18120f6064de06afb42bc89a980c4d80267683ac",
    collection_name: "Negative Carbon NFT",
    royalty_info: {
      artist_address: "0xa9132D23886b63D29858Fe541214fEad5815d64A",
      royalty_fee_by_id: 7,
    },
    maximum_supply: 128,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "Each Negative Carbon NFT (NCNFT) offsets more than its carbon footprint using rigorously validated, third-party audited, retired, carbon offsets. Each token is assigned an offset certificate and mint, and that certificate's serial number becomes the token's generative art's entropy. For more information, visit http://immutablecomputer.com/carbon.html.",
    mintable: false,
    script_type: "p5.js",
    aspect_ratio: 1.77,
    website: "http://immutablecomputer.com/carbon.html",
    external_url: "https://substratum.art/project/negative-carbon",
    license: "All Rights Reserved",
    contract_address: "0xa9132D23886b63D29858Fe541214fEad5815d64A",
    events: ["Transfer", "TokenUpdated"],
    creation_block: 16312447,
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/negativeCarbon/negativeCarbon.min.js",
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: false,
      usesScriptInputs: true,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.crystallizedIllusions,
    chain: Chain.mainnet,
    project_name: "Crystallized Illusions",
    project_slug: ProjectSlug.crystallizedIllusions,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    collection_name: "Crystallized Illusions",
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 10,
    },
    maximum_supply: 99,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "Inspired by Buddhist philosophy, Crystallized Illusions is a collection of 99 pieces created through a generative process. Three variations of this process were made to correspond to the categories of illusions as described by Zhiyi (538-597 CE), the fourth patriarch of the T'ien-t'ai (or Tí Taî) Buddhist tradition. Each process was used to created 33 distinct images.",
    mintable: false,
    script_type: "p5",
    aspect_ratio: 1,
    website: "https://matto.xyz/project/crystallized-illusions/",
    external_url: "https://substratum.art/project/crystallized-illusions",
    license: "All Rights Reserved",
    contract_address: "0x5B17395A9699D2819a9d009bA375a0825b077385",
    events: [],
    creation_block: 16313758,
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/crystallizedIllusions/crystallizedIllusions.min.js",
    },
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      isBulkMint: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.textureAndHues,
    chain: Chain.mainnet,
    project_name: "Texture and Hues",
    project_slug: ProjectSlug.textureAndHues,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    collection_name: "Texture and Hues",
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 3,
    },
    maximum_supply: 256,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "Texture and Hues is an experimental project in minimalism. Images are vector graphic SVGs, and both the images and metadata are created on-chain. Coded by Matto.",
    mintable: false,
    script_type: "solidity",
    aspect_ratio: 1,
    website: "https://matto.xyz/project/texture-and-hues/",
    external_url: "https://substratum.art/project/texture-and-hues",
    license: "CC BY-NC 4.0",
    contract_address: "0x15BF7610a7d50541e865EfA3adad434147a4E1A9",
    events: [],
    creation_block: 15415501,
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: true,
      usesScriptInputs: false,
      usesSvgs: true,
    },
  },
  {
    _id: ProjectId.blonks,
    chain: Chain.mainnet,
    project_name: "BLONKS",
    project_slug: ProjectSlug.blonks,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    collection_name: "BLONKS",
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 3,
    },
    maximum_supply: 4_444,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "BLONKS are owner-responsive, 100% on-chain, CC0, generative vector-graphic illustrations.\n\nTraits are based on values generated at mint and never change, while visual aspects of each NFT are determined by its owner's address (preview changes directly from the smart contract or at http://blonks.xyz). BLONKS NFTs live on Ethereum and require no off-chain dependencies.",
    mintable: false,
    script_type: "solidity",
    aspect_ratio: 1,
    website: "https://substratum.art/project/blonks",
    external_url: "https://blonks.xyz",
    license: "CC0",
    contract_address: "0x7f463b874eC264dC7BD8C780f5790b4Fc371F11f",
    events: ["Transfer"],
    creation_block: 17315032, // not the real creation block
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: true,
      usesScriptInputs: false,
      usesSvgs: true,
    },
  },
  {
    _id: ProjectId["100x10x1-a-goerli"],
    chain: Chain.goerli,
    project_name: "100x10x1-a Goerli",
    project_slug: ProjectSlug["100x10x1-a-goerli"],
    collection_name: "100x10x1-a",
    artist: "Matto",
    artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
    royalty_info: {
      royalty_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_bps: 700,
    },
    maximum_supply: 101,
    starting_index: 0,
    tx_count: 0,
    collection_description:
      "100x10x1 Composition A, is an experimental generative art project: 100 generative tokens, each with 10 layers, together form 1 composite token (100x10x1).",
    description: "",
    mintable: false,
    script_type: "Solidity",
    aspect_ratio: 0.5625,
    website: "https://matto.xyz/project/100x10x1-a",
    external_url: "https://substratum.art/project/100x10x1-a",
    license: "CC BY-NC 4.0",
    contract_address: "0xCC55af23d9861e41C5875F1e76fb3c4122E8C4Fa",
    events: ["Transfer", "OrderChanged"],
    creation_block: 10129683,
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: false,
      usesScriptInputs: false,
      usesSvgs: true,
    },
  },
  {
    _id: ProjectId.haiku,
    chain: Chain.mainnet,
    project_name: "Haiku",
    project_slug: ProjectSlug.haiku,
    collection_name: "Freestyle H(ai)ku",
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    royalty_info: {
      royalty_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_bps: 1000,
    },
    maximum_supply: 1000000000000,
    starting_index: 1,
    tx_count: 0,
    collection_description:
      "Freestyle H(ai)ku is an extension of Matto's 'Freestyle Haiku' poetry project (https://freestylehaiku.com), where he uses various AI technologies to interpret each of his poems, visualize the interpretations, and enhance the resulting artworks detail. Upon mint, each poem is individually stored in the smart contract as the token's description (directly and individually accessible by the smart contract). Image media, AI-generated poem interpretations, and attributes metadata is stored on Arweave, and all metadata is assembled into the token by Substratum. The resulting work is more than a poem or a visual, it is also a vehicle for the introspection of the human condition through the lens of early Artificial Intelligence systems.",
    mintable: false,
    aspect_ratio: 1,
    website: "https://matto.xyz/project/freestyle-h-ai-ku",
    external_url: "https://freestylehaiku.com/poem",
    license: "All Rights Reserved",
    contract_address: "0x74C093fD987Fff140677Aa83B6CC4680B8ef2956",
    events: ["Transfer", "TokenUpdated"],
    creation_block: 18243172,
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: false,
      usesScriptInputs: false,
      usesSvgs: false,
    },
  },
  {
    _id: ProjectId.mfa,
    chain: Chain.goerli,
    project_name: "MFA",
    project_slug: ProjectSlug.mfa,
    collection_name: "MFA",
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 7,
    },
    maximum_supply: 1000000000000,
    starting_index: 1,
    tx_count: 0,
    collection_description:
      "MFA is a varied collection of 1/1 fine artworks by Matto.",
    mintable: false,
    script_type: "",
    aspect_ratio: 1, // This will vary by token, there is now width_ratio and height_ratio. MFA will be variable. Haiku will probably always be 1.
    website: "https://matto.xyz/project/mfa",
    external_url: "https://substratum.art/project/mfa",
    license: "All Rights Reserved", // this can vary per token, but for curated work will typically default to all rights reserved
    contract_address: "0x9c377a454f4792eAc40C65143B2D3b99f5f1bfb3",
    events: ["Transfer", "TokenUpdated"],
    creation_block: 0,
    devParams: {
      useInDev: false,
      useInProd: false,
      usesPuppeteer: true,
      isBulkMint: false,
      usesScriptInputs: false,
      usesSvgs: false,
    },
  },
];

export const abis: Record<ProjectId, AbiItem[]> = {
  [ProjectId.chainlifeTestnet]: chainlifeGoerliAbi as AbiItem[],
  [ProjectId.chainlifeMainnet]: chainlifeMainnetAbi as AbiItem[],
  [ProjectId.mathareMemories]: mathareAbi as AbiItem[],
  [ProjectId.negativeCarbon]: negativeCarbonAbi as AbiItem[],
  [ProjectId.crystallizedIllusions]: crystallizedIllusionsAbi as AbiItem[],
  [ProjectId.textureAndHues]: textureAndHuesAbi as AbiItem[],
  [ProjectId.blonks]: blonksAbi as AbiItem[],
  [ProjectId["100x10x1-a-goerli"]]: oneHundredxAbi as AbiItem[],
  [ProjectId.haiku]: haikuAbi as AbiItem[],
  [ProjectId.mfa]: mfaAbi as AbiItem[],
};

export const projectSizes: ProjectSizes = {
  [ProjectId.chainlifeTestnet]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.chainlifeMainnet]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.mathareMemories]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.negativeCarbon]: {
    full: { width: 3840, height: 2160 },
    mid: { width: 1920, height: 1080 },
    small: { width: 600, height: 338 },
  },
  [ProjectId.crystallizedIllusions]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.textureAndHues]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.blonks]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId["100x10x1-a-goerli"]]: {
    full: { width: 2160, height: 3840 },
    mid: { width: 1080, height: 1920 },
    small: { width: 338, height: 600 },
  },
  [ProjectId.haiku]: {
    full: { width: 2160, height: 2160 },
    mid: { width: 1080, height: 1080 },
    small: { width: 600, height: 600 },
  },
  [ProjectId.mfa]: {
    full: { width: 1620, height: 2160 },
    mid: { width: 1440, height: 1920 },
    small: { width: 450, height: 600 },
  },
};

// {
//   _id: ProjectId.nfn,
//   chain: Chain.mainnet,
//   project_name: 'nfn',
//   project_slug: ProjectSlug.nfn,
//   collection_name: 'NFN (Non-Fungible-Novels)',
//   artist: 'Matto',
//   artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
//   royalty_info: {
//     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
//     royalty_fee_by_id: 7,
//   },
//   maximum_supply: 65535,
//   starting_index: 0,
//   tx_count: 0,
//   collection_description:
//     'NFN (Non-Fungible-Novels) are tokens that are ebooks that can be read on almost any device.',
//   mintable: false,
//   script_type: 'epub.js',
//   aspect_ratio: 0.666,
//   website: 'https://matto.xyz/project/non-fungible-novels',
//   external_url: 'https://substratum.art/project/non-fungible-novels',
//   license: 'All Rights Reserved',
//   contract_address: '0x526Ce354C7fa7D73F035b337C909B9F9b305151B',
//   events: ['TokenUpdated'],
//   creation_block: 16313674,
//   gen_scripts: {
//     main: 'https://cdn.substratum.art/scripts/nfn/nfn.min.js',
//   },
//   devParams: {
//     useInDev: false,
//     useInProd: false,
//     usesPuppeteer: true,
//     isBulkMint: false,
//   },
// },
// {
//   _id: ProjectId.mfa,
//   chain: Chain.mainnet,
//   project_name: 'MFA',
//   project_slug: ProjectSlug.mfa,
//   collection_name: 'MFA (Mattos Fine Art)',
//   artist: 'Matto',
//   artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
//   royalty_info: {
//     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
//     royalty_fee_by_id: 7,
//   },
//   maximum_supply: 65535,
//   starting_index: 0,
//   tx_count: 0,
//   collection_description:
//     'MFA (Mattos Fine Art) is a collection of different fine art projects by Matto.',
//   mintable: false,
//   script_type: 'p5',
//   aspect_ratio: 1.333,
//   website: 'https://matto.xyz/project/mattos-fine-art',
//   external_url: 'https://substratum.art/project/mattos-fine-art',
//   license: 'All Rights Reserved',
//   contract_address: '0x8771c0c3929cf4ebc7b152B2A6337CB65977683F',
//   events: ['TokenUpdated'],
//   creation_block: 16313524,
//   gen_scripts: {
//     main: 'https://cdn.substratum.art/scripts/mfa/mfa.min.js',
//   },
//   devParams: {
//     useInDev: false,
//     useInProd: false,
//     usesPuppeteer: true,
//     isBulkMint: false,
//   },
// },
// {
//   _id: ProjectId.pfp,
//   chain: Chain.mainnet,
//   project_name: 'PFP',
//   project_slug: ProjectSlug.pfp,
//   collection_name: 'PFP (Portraits for People)',
//   artist: 'Matto',
//   artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
//   royalty_info: {
//     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
//     royalty_fee_by_id: 7,
//   },
//   maximum_supply: 65535,
//   starting_index: 0,
//   tx_count: 0,
//   collection_description:
//     'PFP (Portraits for People) are portraits (made by Matto) for...people.',
//   mintable: false,
//   script_type: 'p5',
//   aspect_ratio: 1,
//   website: 'https://matto.xyz/project/portraits-for-people',
//   external_url: 'https://substratum.art/project/portraits-for-people',
//   license: 'All Rights Reserved',
//   contract_address: '0xC968439f09B182a8331277727d61F59280B31D17',
//   events: ['TokenUpdated'],
//   creation_block: 16312631,
//   gen_scripts: {
//     main: 'https://cdn.substratum.art/scripts/pfp/pfp.min.js',
//   },
//   devParams: {
//     useInDev: false,
//     useInProd: false,
//     usesPuppeteer: true,
//     isBulkMint: false,
//   },
// },
