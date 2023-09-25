const projectTemplate = {
  _id: ?, // I'll do this
  chain: 'mainnet', 
  project_name: 'Haiku',
  project_slug: 'freestyle-h-ai-ku',
  collection_name: 'Freestyle H(ai)ku',
  artist: 'Matto',
  artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  royalty_info: {
    artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
    royalty_fee_by_id: 7,
  },
  maximum_supply: 1000000000000,
  starting_index: 1,
  tx_count: 0,
  collection_description: 'Freestyle H(ai)ku is an extension of Matto\'s \'Freestyle Haiku\' poetry project (https://freestylehaiku.com), where he uses various AI technologies to interpret each of his poems, visualize the interpretations, and enhance the resulting artwork\s detail. Upon mint, each poem is individually stored in the smart contract as the token\'s description (directly and individually accessible by the smart contract). Image media, AI-generated poem interpretations, and attributes metadata is stored on Arweave, and all metadata is assembled into the token by Substratum. The resulting work is more than a poem or a visual, it is also a vehicle for the introspection of the human condition through the lens of early Artificial Intelligence systems.',
  mintable: false,
  script_type: '', // perhaps media_type instead of script_type? In MFA it will vary by token. In Haiku it'll probably always be 0.
  aspect_ratio: 1, // This will vary by token, but haiku will probably always be 1.
  website: 'https://matto.xyz/project/freestyle-h-ai-ku',
  external_url: , // this will vary by token but should always be: https://freestylehaiku.com/poem-<token_id>
  license: 'All Rights Reserved', // this can vary per token, but for curated work will typically default to all rights reserved
  contract_address: '',
  events: ['TokenUpdated'],
  creation_block: ,
  gen_scripts: { 
    main: , // There probably will not be generative scripts for this project, but there may be for MFA, returned by tokenDataOf().additionalData
  },
  devParams: {
    // I'll do these
    useInDev: true,
    useInProd: true,
    usesPuppeteer: true,
    isBulkMint: true,
  },
  script_inputs: { // This changes with new contract design. Now it's tokenDataOf(). 
    token_id: 0, // add fields if needed
    token_entropy: ,
    media_URI: ,
    title: ,
    description: 
  },
};

const HAIKU_TOKENDATAOF_RETURN = {
  collection: "Freestyle H(ai)ku", // This will not change but everything else can on a per-token basis
  name: "Candles Flicker", 
  description: "Dark cloud or storm cloud?\\nA pair of candles flicker,\\nBegging to go out.", // need to figure out best/right way to do newlines when uploading them as strings to the contract: single or double escape.
  artist: "Matto", // probably won't change at all in this haiku project
  image: "https://arweave.net/cwpOlX2by6DboJ-wH_miPAzyN6h8c-zOb2YJDF7mjkg",
  animation: "", // if token is not animated, this will be empty / ""
  width_ratio: 1, // width_ration / height_ratio = aspect_ratio
  height_ratio: 1, // width_ration / height_ratio = aspect_ratio
  media_type: 0, // means that a link is in the image and possibly animation fields.
  license: "All Rights Reserved",
  token_entropy: "38580013382348840", // freestyle haiku will have a shorter entropy than MFA
  transfer_count: , // if token is not tracking transfers, this will be empty / ""
  last_transfer_block: , // if token is not tracking transfers, this will be empty / ""
  additional_data: "https://arweave.net/3PfYv7BeVVNSRzHh29TphihQIgw9-riZtNuIcyLlK6g", // For haiku, this will be an arweave link, and the data found here will need to be added to the token's description field. Should this be a JSON object or just plain text uploaded to arweave?
  website: "https://matto.xyz/project/freestyle-h-ai-ku/", // this is unlikely to change per token, but...
  external_url: "https://freestylehaiku.com/poem-1", // this will always be https://freestylehaiku.com/poem-<token_id> returned from the smart contract.
  royalty_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
  royalty_bps: 700,
  attributes: [ // To keep haiku consistent with the contract template, I thought the following json object made sense. That arweave link will a JSON object for attributes. How's the format?
    {
      trait_type: "JSON",
      value: "https://arweave.net/8jgd2L4pX8bDK1xEWGXbrM2heZmzexb90Kmj4xtkT0M"
    }
  ]
  }