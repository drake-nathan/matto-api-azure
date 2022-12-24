import { AbiItem } from 'web3-utils';
import { Chain, IProject, ProjectId } from '../db/schemas/schemaTypes';
import chainlifeGoerliAbi from './abis/ChainlifeGoerli.abi.json';
import chainlifeMainnetAbi from './abis/ChainlifeMainnet.abi.json';
import mathareAbi from './abis/Mathare.abi.json';

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
    gen_script: 'https://cdn.gengames.io/scripts/chainlife/chainlifeToken.min.js',
    devParams: {
      useInDev: true,
      useInProd: false,
      usesPuppeteer: true,
      isBulkMint: false,
    },
  },
  {
    _id: ProjectId.chainlifeMainnet,
    project_name: 'Chainlife',
    project_slug: 'chainlife',
    artist: 'Matto',
    artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
    royalty_info: {
      artist_address: '0xF8d9056db2C2189155bc25A30269dc5dDeD15d46',
      royalty_fee_by_id: 7,
    },
    description:
      "**Chainlife tokens:** microcosms of digital life that are interactive, evolving, and aware.\n\n**Chainlife world:** an ever-changing macrocosm that is controlled by you, that is collaborative, (also) on-chain, and extendible.\n\n**Chainlife forest:** growing a healthy forest ecosystem (not on-chain) to fight climate change and keep Chainlife carbon negative.\n\n**Chainlife project:** genesis project of Matto's blockchain interactive NFT platform, GenGames.\n\n---\n\n**Interactivity:** Chainlife tokens are self-contained applications that have many controls. Here are basic instructions to get started:\n\n- Click, press, or use the spacebar to start or pause a simulation.\n\n- Use keys 1-5 to change the speed.\n\n- Use keys 6-0 to change the rulesets (these unlock as the token gains levels).\n\n- Use 'Z' to reset the starting population, or refresh the page to entirely restart the simulation.\n\n- For additional help, use 'H'.\n\n- For in-depth instructions, view the documentation, linked from [chainlife.xyz](https://chainlife.xyz/).",
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
    gen_script: 'https://cdn.gengames.io/scripts/chainlife/chainlifeToken.min.js',
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
    project_slug: 'mathare-memories',
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
    collection_description: `Mathare Memories is an interactive, multimedia collection of 68 photographs taken in the Mathare slum of Nairobi, Kenya in 2007. High resolution images and audio files are permanently stored on Arweave, are backed up on Github, and are retrieved for display by on-chain JavaScript running in your browser.\n\n**Interactivity:**\n\nPress 'P' or long press/click & release on an image to play a short audio recording of Matto reading the token's description. Press 'N' or double-click to display the next token in the collection, and press 'R' to return to the token's starting content. Press '<' or '>' to change the brightness of the matte displayed behind the image.\n\n**Proceeds and Royalties:**\n\n100% of all artist proceeds are being transparently directed to charity. 100% of all "creator" secondary fees are being transparently directed to charity. Matto and substratum.art (the platform that powers this multimedia collection) receive no compensation for this project.\n\nAs a 100% charity project, 10% royalties are expected to be paid on all sales and should be sent to the collection's smart contract address.\n\n**On-Chain Metadata:**\n\nLike all substratum.art projects, all metadata is stored on-chain. Like all substratum.art projects that use JavaScript, ARIA descriptions are included in the live generator's HTML to enhance the experience of audiences with visual impairment.`,
    mintable: false,
    script_type: 'p5.js',
    aspect_ratio: 1,
    website: 'https://substratum.art/project/mathare-memories',
    external_url: 'https://substratum.art/project/mathare-memories',
    license: 'All Rights Reserved',
    contract_address: '0x2eEa9f8eb2a3365175c7cb25Db9ae277bE218806',
    events: ['Transfer'],
    creation_block: 16215143,
    gen_script: 'https://cdn.gengames.io/scripts/mathare/mathareMemories.min.js',
    devParams: {
      useInDev: true,
      useInProd: true,
      usesPuppeteer: false,
      isBulkMint: true,
    },
  },
];

export const abis = {
  [projects[ProjectId.chainlifeTestnet]._id]: chainlifeGoerliAbi as AbiItem[],
  [projects[ProjectId.chainlifeMainnet]._id]: chainlifeMainnetAbi as AbiItem[],
  [projects[ProjectId.mathare]._id]: mathareAbi as AbiItem[],
};
