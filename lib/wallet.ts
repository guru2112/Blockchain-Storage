// 👇 Extend window type locally
declare global {
  interface Window {
    ethereum?: any;
  }
}

export const connectWallet = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined") {
      throw new Error("Window is undefined");
    }

    if (!window.ethereum) {
      alert("Please install MetaMask");
      return null;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return accounts[0];
  } catch (error) {
    console.error("Wallet connection failed:", error);
    return null;
  }
};