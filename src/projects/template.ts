export const projectTemplate = {
  _id: 5, // I'll do this
  artist: "Matto",
  artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
  aspect_ratio: 1,
  chain: "mainnet",
  collection_description: "",
  collection_name: "",
  contract_address: "0x5B17395A9699D2819a9d009bA375a0825b077385",
  creation_block: 16313758,
  devParams: {
    isBulkMint: true,
    // I'll do these
    useInDev: true,
    useInProd: true,
    usesPuppeteer: true,
  },
  events: ["Transfer"], // contract events we need to listen for, if any
  external_url: "https://substratum.art/project/crystallized-illusions",
  gen_scripts: {
    main: "https://cdn.substratum.art/scripts/crystallizedIllusions/crystallizedIllusions.min.js",
  },
  license: "All Rights Reserved",
  maximum_supply: 99,
  mintable: false,
  project_name: "",
  project_slug: "",
  royalty_info: {
    artist_address: "0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653",
    royalty_fee_by_id: 10,
  },
  script_inputs: {
    token_id: 0, // add fields if needed
  },
  script_type: "p5",
  starting_index: 0,
  tx_count: 0,
  website: "https://matto.xyz/project/crystallized-illusions/",
};
