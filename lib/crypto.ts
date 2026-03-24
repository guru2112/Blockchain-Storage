import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { getCachedLoginSignature, getEncryptionMessage } from "@/lib/wallet";

declare global {
  interface Window {
    ethereum?: any;
  }
}

let cachedKey: string | null = null;

export const clearEncryptionKey = () => {
  cachedKey = null;
};

// 🔐 Generate encryption key (only once)
export const getEncryptionKey = async (): Promise<string> => {
  if (cachedKey) return cachedKey;

  if (!window.ethereum) throw new Error("MetaMask not found");

  const appSecret = process.env.NEXT_PUBLIC_APP_SECRET;
  if (!appSecret) {
    throw new Error("Missing NEXT_PUBLIC_APP_SECRET");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const message = getEncryptionMessage(address);
  const cachedSignature = getCachedLoginSignature();
  const signature = cachedSignature ?? (await signer.signMessage(message));

  cachedKey = CryptoJS.SHA256(signature + appSecret).toString();

  return cachedKey;
};

// 🔐 Encrypt file
export const encryptFile = async (file: File): Promise<string> => {
  const key = await getEncryptionKey();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileData = reader.result as string;

        const encrypted = CryptoJS.AES.encrypt(fileData, key).toString();

        resolve(encrypted);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// 🔓 Decrypt file
export const decryptFile = async (encryptedData: string): Promise<string> => {
  const key = await getEncryptionKey();

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const original = bytes.toString(CryptoJS.enc.Utf8);

    if (!original) {
      throw new Error("Decryption failed");
    }

    return original;
  } catch {
    throw new Error(
      "Decryption failed. Ensure you are using the same wallet and APP_SECRET used during upload."
    );
  }
};
