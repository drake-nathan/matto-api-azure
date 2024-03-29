import axios from "axios";

export const fetchFocusSupply = async () => {
  const response = await axios({
    data: {
      query: `
        {
          project(id: "0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270-181") {
            name
            tokens(first: 1000) {
              tokenId
              owner {
                id
              }
            }
          }
        }
        `,
    },
    method: "post",
    url: "https://api.thegraph.com/subgraphs/name/artblocks/art-blocks",
  });

  return response.data.data.project.tokens.length;
};
