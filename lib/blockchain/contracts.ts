import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const expectedChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

// 👇 Extend window type locally (no global file needed)
// ...existing code...

export const getContract = async () => {
  if (typeof window === "undefined") {
    throw new Error("Window is undefined (SSR issue)");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  if (!contractAddress) {
    throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS");
  }

  if (!Number.isInteger(expectedChainId) || expectedChainId <= 0) {
    throw new Error("Missing or invalid NEXT_PUBLIC_CHAIN_ID");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const activeChainId = Number(network.chainId);

  if (activeChainId !== expectedChainId) {
    throw new Error(
      `Wrong network selected in MetaMask. Please switch to chain ID ${expectedChainId}.`
    );
  }

  const signer = await provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  return contract;
};
