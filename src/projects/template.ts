const projectTemplate = {
  _id: 5, // I'll do this
  chain: 'mainnet',
  project_name: '',
  project_slug: '',
  collection_name: '',
  artist: 'Matto',
  artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
  royalty_info: {
    artist_address: '0xA6a4Fe416F8Bf46bc3bCA068aC8b1fC4DF760653',
    royalty_fee_by_id: 10,
  },
  maximum_supply: 99,
  starting_index: 0,
  tx_count: 0,
  collection_description: '',
  mintable: false,
  script_type: 'p5',
  aspect_ratio: 1,
  website: 'https://matto.xyz/project/crystallized-illusions/',
  external_url: 'https://substratum.art/project/crystallized-illusions',
  license: 'All Rights Reserved',
  contract_address: '0x5B17395A9699D2819a9d009bA375a0825b077385',
  events: ['Transfer'], // contract events we need to listen for, if any
  creation_block: 16313758,
  gen_scripts: {
    main: 'https://cdn.substratum.art/scripts/crystallizedIllusions/crystallizedIllusions.min.js',
  },
  devParams: {
    // I'll do these
    useInDev: true,
    useInProd: true,
    usesPuppeteer: true,
    isBulkMint: true,
  },
  script_inputs: {
    token_id: 0, // add fields if needed
  },
};
