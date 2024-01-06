// const projectTemplate = {
//   _id: 5, // I'll do this
//   chain: 'mainnet',
//   project_name: 'MFA',
//   project_slug: 'mfa',
//   collection_name: 'MFA',
//   artist: 'Matto',
//   artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
//   royalty_info: {
//     artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
//     royalty_fee_by_id: 7,
//   },
//   maximum_supply: 1000000000000,
//   starting_index: 1,
//   tx_count: 0,
//   collection_description: 'MFA is a varied collection of 1/1 fine artworks by Matto.',
//   mintable: false,
//   script_type: '', // perhaps media_type instead of script_type? In MFA it will vary by token. In Haiku it'll probably always be 0.
//   aspect_ratio: 1, // This will vary by token, there is now width_ratio and height_ratio. MFA will be variable. Haiku will probably always be 1.
//   website: 'https://matto.xyz/project/mfa',
//   external_url: 'https://substratum.art/project/mfa',
//   license: 'All Rights Reserved', // this can vary per token, but for curated work will typically default to all rights reserved
//   contract_address: '',
//   events: ['TokenUpdated'],
//   creation_block: ,
//   gen_scripts: {
//     main: , // If there is a gen script for a token, it'll be returned in that token's additionalData
//   },
//   devParams: {
//     // I'll do these
//     useInDev: true,
//     useInProd: true,
//     usesPuppeteer: true,
//     isBulkMint: true,
//   },
//   script_inputs: { // This changes with new contract design. Now it's tokenDataOf().
//     token_id: 0, // add fields if needed
//     token_entropy: ,
//     media_URI: ,
//     title: ,
//     description:
//   },
// };

// const MFA_TOKENDATAOF_RETURN = {
//   collection: "MFA", // This will not change but everything else can on a per-token basis
//   name: "Enso 5",
//   description: "Enso 5 is a quite-complete circle.",
//   artist: "Matto", // even this can change per token - for collabs
//   image: "https://matto.xyz/wp-content/uploads/2021/06/05.png",
//   animation: , // if token is not animated, this will be empty / ""
//   width_ratio: 1, // width_ration / height_ratio = aspect_ratio
//   height_ratio: 1, // width_ration / height_ratio = aspect_ratio
//   media_type: 0, // means that a link is in the image and possibly animation fields.
//   license: "CC BY-NC 4.0",
//   token_entropy: "38580013382348840168098146094134871313713394870678079179218160746907041637981",
//   transfer_count: , // if token is not tracking transfers, this will be empty / ""
//   last_transfer_block: , // if token is not tracking transfers, this will be empty / ""
//   additional_data: , // this field is mainly for on-chain storage mapped to individual tokens. This can include notes, comments, backup links, or a generative script
//   website: "https://matto.xyz/project/mfa/", // this is unlikely to change per token, but...
//   external_url: "https://www.artblocks.io/collections/presents/projects/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/34", // this is likely to change per token/ groups of tokens
//   royalty_address: "0xe4c8efd2ed3051b22ea3eede1af266452b0e66e9",
//   royalty_bps: 700,
//   attributes: [ // attributes can be any number of elements, including just [].
//       {trait_type: "thickness",
//       value: "THIC"},
//       {trait_type: "color",
//       value: "green"}
//     ]
//   }
