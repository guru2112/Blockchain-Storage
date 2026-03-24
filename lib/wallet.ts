import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

let cachedLoginSignature: string | null = null;

export const getCachedLoginSignature = () => cachedLoginSignature;

export const clearCachedLoginSignature = () => {
  cachedLoginSignature = null;
};

export const getEncryptionMessage = (address: string) =>
  `Decentralized Drive encryption key for ${address}`;

const isLocalhost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
};

const assertWalletEnvironment = () => {
  if (typeof window === "undefined") {
    throw new Error("Wallet connection is only available in the browser.");
  }

  if (!window.isSecureContext && !isLocalhost()) {
    throw new Error(
      "MetaMask requires HTTPS on network URLs. Open this app with HTTPS, or use localhost on your own machine."
    );
  }

  if (!window.ethereum) {
    throw new Error(
      "MetaMask was not detected. Install/enable MetaMask in this browser and allow access to this site."
    );
  }
};

// 🔗 Connect wallet (forces MetaMask popup)
export const connectWallet = async (): Promise<string> => {
  assertWalletEnvironment();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum!);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    return signer.getAddress();
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 4001) {
      throw new Error("Wallet connection request was rejected.");
    }

    throw new Error("Failed to connect wallet. Please try again.");
  }
};

// 🔐 Signature-based login
export const signLogin = async (): Promise<string> => {
  assertWalletEnvironment();

  try {
    const provider = new ethers.BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const message = getEncryptionMessage(address);
    const signature = await signer.signMessage(message);
    cachedLoginSignature = signature;
    return signature;
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 4001) {
      throw new Error("Signature request was rejected.");
    }

    throw new Error("Failed to sign login message. Please try again.");
  }
};
