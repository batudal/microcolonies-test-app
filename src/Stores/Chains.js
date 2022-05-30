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

module.exports = fantom;
