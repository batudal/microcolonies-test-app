import { writable } from "svelte/store";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export let userConnected = writable(false);
export let userAddress = writable("");
export let nodeProvider = writable();
export let networkProvider = writable("");
export let networkSigner = writable("");
export let chainID = writable("");

const WalletConnectProvider = window.WalletConnectProvider.default;
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    display: {
      logo: "/images/walletConnect.png",
      name: "WalletConnect",
      description: " ",
    },
    options: {
      qrcodeModalOptions: {
        mobileLinks: ["rainbow", "metamask", "argent", "trust"],
      },
    },
  },
  injected: {
    display: {
      logo: "/images/metamask.png",
      name: "Metamask",
      description: " ",
    },
    package: null,
  },
};

const web3Modal = new Web3Modal({
  providerOptions: providerOptions,
  cacheProvider: true,
  theme: {
    background: "#070707",
    main: "#ffffff",
    secondary: "#dedede",
    hover: "#111111",
  },
});

export const disconnectWallet = () => {
  web3Modal.clearCachedProvider();
  userConnected.set(false);
  userAddress.set("");
  networkProvider.set("");
  networkSigner.set("");
  chainID.set("");
};

export const connectWallet = async () => {
  const instance = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(instance);
  const signer = provider.getSigner();
  networkProvider.set(provider);
  networkSigner.set(signer);
  userAddress.set(await signer.getAddress());
  chainID.set(await signer.getChainId());
  userConnected.set(true);
};

if (web3Modal.cachedProvider) {
  connectWallet();
}

export const connectNode = async () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://eth-goerli.alchemyapi.io/v2/G0AmdAOEKoIachkcZeAvt7q06jOxL6PC"
  );
  nodeProvider.set(provider);
};
