import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

// 👇 Extend window type locally (no global file needed)
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const getContract = async () => {
  if (typeof window === "undefined") {
    throw new Error("Window is undefined (SSR issue)");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const contract = new ethers.Contract(contractAddress, abi, signer);

  return contract;
};