import type { AbiItem } from "web3-utils";

import type { IProject, ProjectSizes } from "../db/schemas/schemaTypes";

// abi's
import oneHundredxAbi from "./100x10x1x/abi/100x10x1.abi.json";
import blonksAbi from "./abis/BLONKS.abi.json";
import chainlifeGoerliAbi from "./abis/ChainlifeGoerli.abi.json";
import chainlifeMainnetAbi from "./abis/ChainlifeMainnet.abi.json";
import crystallizedIllusionsAbi from "./abis/CrystallizedIllusions.abi.json";
import mathareAbi from "./abis/Mathare.abi.json";
import negativeCarbonAbi from "./abis/NegativeCarbon.abi.json";
import textureAndHuesAbi from "./abis/TextureAndHues.abi.json";
import haikuAbi from "./haiku/abi/haiku.abi.json";
import mfaAbi from "./mfa/abi/mfa.abi.json";

export type Chain = "goerli" | "mainnet";
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
  "100x10x1-a-goerli" = "100x10x1-a-goerli",
  blonks = "blonks",
  chainlifeMainnet = "chainlife",
  chainlifeTestnet = "chainlife-testnet",
  crystallizedIllusions = "crystallized-illusions",
  haiku = "haiku",
  mathareMemories = "mathare-memories",
  mfa = "mfa",
  negativeCarbon = "negative-carbon",
  textureAndHues = "texture-and-hues",
}

export const projects: IProject[] = [
  {
    _id: ProjectId.chainlifeTestnet,
    artist: "Matto",
    artist_address: "0x318c7370927287a7d03fa659848C25db88213DbA",
    aspect_ratio: 1,
    chain: "goerli",
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** ever-changing macrocosm that is controlled by you, collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's Blockchain-interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    collection_image:
      "https://media.matto.xyz/gengames/chainlife_multicolor.png",
    collection_name: "Chainlife",
    contract_address: "0x04c9E99D134565eB0F0Fef07FB70741A5b615075",
    creation_block: 7729596,
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    devParams: {
      isBulkMint: false,
      useInDev: false,
      useInProd: true,
      usesPuppeteer: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
    events: ["Transfer", "CustomRule", "ShiftLevel"],
    external_url: "https://chainlife.xyz",
    gen_scripts: {
      alt: "https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js",
      main: "https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js",
      mobileControls:
        "https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js",
      painting:
        "https://cdn.substratum.art/scripts/chainlife/chainlifePainting.min.js",
      world:
        "https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js",
    },
    license: "CC BY-NC 4.0",
    maximum_supply: 4096,
    mintable: true,
    project_name: "Chainlife Testnet",
    project_slug: ProjectSlug.chainlifeTestnet,
    royalty_info: {
      artist_address: "0x318c7370927287a7d03fa659848C25db88213DbA",
      royalty_fee_by_id: 7,
    },
    script_type: "p5.js",
    starting_index: 0,
    tx_count: 0,
    website: "https://matto.xyz/project/chainlife",
  },
  {
    _id: ProjectId.chainlifeMainnet,
    artist: "Matto",
    artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** an ever-changing macrocosm that is controlled by you, that is collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's blockchain interactive NFT platform, GenGames.\n\nLearn more at [chainlife.xyz](https://chainlife.xyz/).",
    collection_image:
      "https://media.matto.xyz/gengames/chainlife_multicolor.png",
    collection_name: "Chainlife",
    contract_address: "0x4E171e0F14a9046e14B93221f31Acd2EC4Af8429",
    creation_block: 15908912,
    description:
      "Chainlife tokens are microcosms of digital life that are interactive, evolving, and aware. The project explores cellular automata and uses token ownership history to shape the starting population of cells.\n\nAt the most granular level, Chainlife is a collection of 4096 individual generative art NFTs on the Ethereum blockchain. Each token is aware of many pieces of blockchain data, and the tokens can change: evolving and maturing in unique ways as they respond to transfers and on-chain customizations that their owners can set.\n\nThe tokens combine together to form a collaborative and ever-evolving game world, forming a grid of 64 x 64 token-cells. Each token-cell can exist on any level in this world, ranging from level 0 to level 9999. As tokens 'mature', they gain levels that are recorded in their on-chain metadata, and the corresponding token-cells in the world grid also gain a level. Owners can also 'level shift' their token by a positive or negative value, allowing them to precisely control the token's maturation and world levels. This 3D world is a representation of the project's on-chain activity, and can be explored at https://chainlife.xyz. Each level of this 3D world can be played as if it was a Chainlife token, enabling individual token owners to collaborate and build patterns for anyone in the world to play.\n\nThinking about the greater world, this project is committed to fight climate change. The API and front end apps all run on a carbon neutral platform, and to create a positive environmental impact, the project's carbon footprint at mint out, times 100, has been carbon offset. Additionally, mint funds will be used to buy bare land and grow a forest to help fight climate change and raise awareness.\n\nChainlife is the genesis project of Substratum, an on-chain gen-art platform built from the ground up to support dynamic and experimental crypto art projects on Ethereum.\n\nExploring the idea of the Chainlife world being a metaverse of its own, an alternate renderer is included in the on-chain scripts and is viewable on each token's page on https://chainlife.xyz. These changing, 3D terrains called 'Esoterra' have specific metadata stored in each Chainlife token, and they represent the 'biome(s)' associated with the token's palette.",
    devParams: {
      isBulkMint: false,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
    events: ["Transfer", "CustomRule", "ShiftLevel"],
    external_url: "https://chainlife.xyz",
    gen_scripts: {
      alt: "https://cdn.substratum.art/scripts/chainlife/chainlifeEsoterra.min.js",
      main: "https://cdn.substratum.art/scripts/chainlife/chainlifeToken.min.js",
      mobileControls:
        "https://cdn.substratum.art/scripts/chainlife/tokenMobileMenu.min.js",
      painting:
        "https://cdn.substratum.art/scripts/chainlife/chainlifePainting.min.js",
      world:
        "https://cdn.substratum.art/scripts/chainlife/chainlifeWorld.min.js",
    },
    license: "CC BY-NC 4.0",
    maximum_supply: 4096,
    mintable: true,
    project_name: "Chainlife",
    project_slug: ProjectSlug.chainlifeMainnet,
    royalty_info: {
      artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
      royalty_fee_by_id: 7,
    },
    script_type: "p5.js",
    starting_index: 0,
    tx_count: 0,
    website: "https://matto.xyz/project/chainlife",
  },
  {
    _id: ProjectId.mathareMemories,
    appended_description:
      "\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.",
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "Mathare Memories is an interactive, multimedia collection of 68 photographs taken in the Mathare slum of Nairobi, Kenya in 2007. High resolution images and audio files are permanently stored on Arweave, are backed up on Github, and are retrieved for display by on-chain JavaScript running in your browser.\n\nInteractivity:\n\nPress 'P' or long press/click and release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Use the greater-than and less-than keys to change the brightness of the matte displayed behind the image.\n\nProceeds and Royalties:\n\n100% of all artist proceeds are being transparently directed to charity. 100% of all 'creator' secondary fees are being transparently directed to charity. Matto and substratum.art (the platform that powers this multimedia collection) receive no compensation for this project.\n\nAs a 100% charity project, 10% royalties are expected to be paid on all sales and should be sent to the collection's smart contract address.\n\nOn-Chain Metadata:\n\nLike all substratum.art projects, all metadata is stored on-chain. Like all substratum.art projects that use JavaScript, ARIA descriptions are included in the live generator's HTML to enhance the experience of audiences with visual impairment.",
    collection_image:
      "https://o3irvsyqapmasj3xza6fs3eevrc7p3shvqyrwcmfxiu4anqpqxna.arweave.net/dtEayxAD2Aknd8g8WWyErEX37kesMRsJhbopwDYPhdo/1.png",
    collection_name: "Mathare Memories",
    contract_address: "0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806",
    creation_block: 16215143,
    devParams: {
      isBulkMint: true,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      usesScriptInputs: true,
      usesSvgs: false,
    },
    events: ["Transfer"],
    external_url: "https://substratum.art/project/mathare-memories",
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/mathare/mathareMemories.min.js",
      preMainScript:
        "https://cdn.substratum.art/scripts/mathare/descriptions.min.js",
    },
    license: "All Rights Reserved",
    maximum_supply: 68,
    mintable: false,
    project_name: "Mathare Memories",
    project_slug: ProjectSlug.mathareMemories,
    royalty_info: {
      charity_address: "0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806",
      royalty_fee_by_id: 10,
    },
    script_type: "p5.js",
    starting_index: 1,
    tx_count: 0,
    website: "https://substratum.art/project/mathare-memories",
  },
  {
    _id: ProjectId.negativeCarbon,
    artist: "Immutable Computer",
    artist_address: "0x18120f6064de06afb42bc89a980c4d80267683ac",
    aspect_ratio: 1.77,
    chain: "mainnet",
    collection_description:
      "Each Negative Carbon NFT (NCNFT) offsets more than its carbon footprint using rigorously validated, third-party audited, retired, carbon offsets. Each token is assigned an offset certificate and mint, and that certificate's serial number becomes the token's generative art's entropy. For more information, visit http://immutablecomputer.com/carbon.html.",
    collection_name: "Negative Carbon NFT",
    contract_address: "0xa9132D23886b63D29858Fe541214fEad5815d64A",
    creation_block: 16312447,
    devParams: {
      isBulkMint: false,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
    events: ["Transfer", "TokenUpdated"],
    external_url: "https://substratum.art/project/negative-carbon",
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/negativeCarbon/negativeCarbon.min.js",
    },
    license: "All Rights Reserved",
    maximum_supply: 128,
    mintable: false,
    project_name: "Negative Carbon",
    project_slug: ProjectSlug.negativeCarbon,
    royalty_info: {
      artist_address: "0xa9132D23886b63D29858Fe541214fEad5815d64A",
      royalty_fee_by_id: 7,
    },
    script_type: "p5.js",
    starting_index: 0,
    tx_count: 0,
    website: "http://immutablecomputer.com/carbon.html",
  },
  {
    _id: ProjectId.crystallizedIllusions,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "Inspired by Buddhist philosophy, Crystallized Illusions is a collection of 99 pieces created through a generative process. Three variations of this process were made to correspond to the categories of illusions as described by Zhiyi (538-597 CE), the fourth patriarch of the T'ien-t'ai (or Tí Taî) Buddhist tradition. Each process was used to created 33 distinct images.",
    collection_name: "Crystallized Illusions",
    contract_address: "0x5B17395A9699D2819a9d009bA375a0825b077385",
    creation_block: 16313758,
    devParams: {
      isBulkMint: true,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: true,
      usesScriptInputs: true,
      usesSvgs: false,
    },
    events: [],
    external_url: "https://substratum.art/project/crystallized-illusions",
    gen_scripts: {
      main: "https://cdn.substratum.art/scripts/crystallizedIllusions/crystallizedIllusions.min.js",
    },
    license: "All Rights Reserved",
    maximum_supply: 99,
    mintable: false,
    project_name: "Crystallized Illusions",
    project_slug: ProjectSlug.crystallizedIllusions,
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 10,
    },
    script_type: "p5",
    starting_index: 0,
    tx_count: 0,
    website: "https://matto.xyz/project/crystallized-illusions/",
  },
  {
    _id: ProjectId.textureAndHues,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "Texture and Hues is an experimental project in minimalism. Images are vector graphic SVGs, and both the images and metadata are created on-chain. Coded by Matto.",
    collection_name: "Texture and Hues",
    contract_address: "0x15BF7610a7d50541e865EfA3adad434147a4E1A9",
    creation_block: 15415501,
    devParams: {
      isBulkMint: true,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      usesScriptInputs: false,
      usesSvgs: true,
    },
    events: [],
    external_url: "https://substratum.art/project/texture-and-hues",
    license: "CC BY-NC 4.0",
    maximum_supply: 256,
    mintable: false,
    project_name: "Texture and Hues",
    project_slug: ProjectSlug.textureAndHues,
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 3,
    },
    script_type: "solidity",
    starting_index: 0,
    tx_count: 0,
    website: "https://matto.xyz/project/texture-and-hues/",
  },
  {
    _id: ProjectId.blonks,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "BLONKS are owner-responsive, 100% on-chain, CC0, generative vector-graphic illustrations.\n\nTraits are based on values generated at mint and never change, while visual aspects of each NFT are determined by its owner's address (preview changes directly from the smart contract or at http://blonks.xyz). BLONKS NFTs live on Ethereum and require no off-chain dependencies.",
    collection_name: "BLONKS",
    contract_address: "0x7f463b874eC264dC7BD8C780f5790b4Fc371F11f",
    creation_block: 17315032, // not the real creation block
    devParams: {
      isBulkMint: true,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      usesScriptInputs: false,
      usesSvgs: true,
    },
    events: ["Transfer"],
    external_url: "https://blonks.xyz",
    license: "CC0",
    maximum_supply: 4_444,
    mintable: false,
    project_name: "BLONKS",
    project_slug: ProjectSlug.blonks,
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 3,
    },
    script_type: "solidity",
    starting_index: 0,
    tx_count: 0,
    website: "https://substratum.art/project/blonks",
  },
  {
    _id: ProjectId["100x10x1-a-goerli"],
    artist: "Matto",
    artist_address: "0xF8d9056db2C2189155bc25A30269dc5dDeD15d46",
    aspect_ratio: 0.5625,
    chain: "goerli",
    collection_description:
      "100x10x1 Composition A, is an experimental generative art project: 100 generative tokens, each with 10 layers, together form 1 composite token (100x10x1).",
    collection_name: "100x10x1-a",
    contract_address: "0x6aBf38A6cB1f0ab87047E80Efd1B109C8E5CeFF3",
    creation_block: 10129683,
    description: "",
    devParams: {
      isBulkMint: false,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      usesScriptInputs: false,
      usesSvgs: true,
    },
    events: ["Transfer", "OrderChanged"],
    external_url: "https://substratum.art/project/100x10x1-a",
    license: "CC BY-NC 4.0",
    maximum_supply: 101,
    mintable: false,
    project_name: "100x10x1-a Goerli",
    project_slug: ProjectSlug["100x10x1-a-goerli"],
    royalty_info: {
      royalty_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_bps: 700,
    },
    script_type: "Solidity",
    starting_index: 0,
    tx_count: 0,
    website: "https://matto.xyz/project/100x10x1-a",
  },
  {
    _id: ProjectId.haiku,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1,
    chain: "mainnet",
    collection_description:
      "Freestyle H(ai)ku is an extension of Matto's 'Freestyle Haiku' poetry project (https://freestylehaiku.com), where he uses various AI technologies to interpret each of his poems, visualize the interpretations, and enhance the resulting artworks detail. Upon mint, each poem is individually stored in the smart contract as the token's description (directly and individually accessible by the smart contract). Image media, AI-generated poem interpretations, and attributes metadata is stored on Arweave, and all metadata is assembled into the token by Substratum. The resulting work is more than a poem or a visual, it is also a vehicle for the introspection of the human condition through the lens of early Artificial Intelligence systems.",
    collection_name: "Freestyle H(ai)ku",
    contract_address: "0x74C093fD987Fff140677Aa83B6CC4680B8ef2956",
    creation_block: 18243172,
    devParams: {
      isBulkMint: false,
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      usesScriptInputs: false,
      usesSvgs: false,
    },
    events: ["Transfer", "TokenUpdated"],
    external_url: "https://freestylehaiku.com/poem",
    license: "All Rights Reserved",
    maximum_supply: 1000000,
    mintable: false,
    project_name: "Haiku",
    project_slug: ProjectSlug.haiku,
    royalty_info: {
      royalty_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_bps: 1000,
    },
    starting_index: 1,
    tx_count: 0,
    website: "https://matto.xyz/project/freestyle-h-ai-ku",
  },
  {
    _id: ProjectId.mfa,
    artist: "Matto",
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    aspect_ratio: 1, // This will vary by token, there is now width_ratio and height_ratio. MFA will be variable. Haiku will probably always be 1.
    chain: "goerli",
    collection_description:
      "MFA is a varied collection of 1/1 fine artworks by Matto.",
    collection_name: "MFA",
    contract_address: "0x9c377a454f4792eAc40C65143B2D3b99f5f1bfb3",
    creation_block: 0,
    devParams: {
      isBulkMint: false,
      useInDev: false,
      useInProd: false,
      usesPuppeteer: true,
      usesScriptInputs: false,
      usesSvgs: false,
    },
    events: ["Transfer", "TokenUpdated"],
    external_url: "https://substratum.art/project/mfa",
    license: "All Rights Reserved", // this can vary per token, but for curated work will typically default to all rights reserved
    maximum_supply: 1000000000000,
    mintable: false,
    project_name: "MFA",
    project_slug: ProjectSlug.mfa,
    royalty_info: {
      artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
      royalty_fee_by_id: 7,
    },
    script_type: "",
    starting_index: 1,
    tx_count: 0,
    website: "https://matto.xyz/project/mfa",
  },
];

export const abis: Record<ProjectId, AbiItem[]> = {
  [ProjectId.blonks]: blonksAbi as AbiItem[],
  [ProjectId.chainlifeMainnet]: chainlifeMainnetAbi as AbiItem[],
  [ProjectId.chainlifeTestnet]: chainlifeGoerliAbi as AbiItem[],
  [ProjectId.crystallizedIllusions]: crystallizedIllusionsAbi as AbiItem[],
  [ProjectId.haiku]: haikuAbi as AbiItem[],
  [ProjectId.mathareMemories]: mathareAbi as AbiItem[],
  [ProjectId.mfa]: mfaAbi as AbiItem[],
  [ProjectId.negativeCarbon]: negativeCarbonAbi as AbiItem[],
  [ProjectId.textureAndHues]: textureAndHuesAbi as AbiItem[],
  [ProjectId["100x10x1-a-goerli"]]: oneHundredxAbi as AbiItem[],
};

export const projectSizes: ProjectSizes = {
  [ProjectId.blonks]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.chainlifeMainnet]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.chainlifeTestnet]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.crystallizedIllusions]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.haiku]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.mathareMemories]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId.mfa]: {
    full: { height: 2160, width: 1620 },
    mid: { height: 1920, width: 1440 },
    small: { height: 600, width: 450 },
  },
  [ProjectId.negativeCarbon]: {
    full: { height: 2160, width: 3840 },
    mid: { height: 1080, width: 1920 },
    small: { height: 338, width: 600 },
  },
  [ProjectId.textureAndHues]: {
    full: { height: 2160, width: 2160 },
    mid: { height: 1080, width: 1080 },
    small: { height: 600, width: 600 },
  },
  [ProjectId["100x10x1-a-goerli"]]: {
    full: { height: 3840, width: 2160 },
    mid: { height: 1920, width: 1080 },
    small: { height: 960, width: 540 },
  },
};

// {
//   _id: ProjectId.nfn,
//   chain: "mainnet",
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
//   chain: "mainnet",
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
//   chain: "mainnet",
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
