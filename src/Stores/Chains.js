const fantom = {
  name: "fantom",
  options: {
    method: "wallet_addEthereumChain",
    params: [
      {
        chainName: "Fantom",
        chainId: "0xFA",
        rpcUrls: ["https://rpc.ftm.tools/"],
        blockExplorerUrls: ["https://ftmscan.com/"],
        nativeCurrency: {
          name: "Fantom",
          symbol: "FTM",
          decimals: 18,
        },
      },
    ],
  },
};
const polygon = {
  name: "polygon",
  options: {
    method: "wallet_addEthereumChain",
    params: [
      {
        chainName: "Polygon",
        chainId: "0x89",
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"],
        nativeCurrency: {
          name: "Polygon Matic",
          symbol: "MATIC",
          decimals: 18,
        },
      },
    ],
  },
};

module.exports = fantom;
module.exports = polygon;
