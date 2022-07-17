const goerli = {
  name: "goerli",
  options: {
    method: "wallet_addEthereumChain",
    params: [
      {
        chainName: "Goerli Testnet",
        chainId: "0x89",
        rpcUrls: ["https://goerli.infura.io/v3/"],
        blockExplorerUrls: ["https://goerli.etherscan.io"],
        nativeCurrency: {
          name: "GoerliETH",
          symbol: "ETH",
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

module.exports = goerli;
module.exports = polygon;
