import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { getCachedLoginSignature, getEncryptionMessage } from "@/lib/wallet";

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

let cachedKey: string | null = null;

export const clearEncryptionKey = () => {
  cachedKey = null;
};

// 🔐 Generate encryption key (only once) - USER-SPECIFIC
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

// 🔐 Generate shared encryption key - For sharing files (not user-specific)
export const getSharedEncryptionKey = (): string => {
  const appSecret = process.env.NEXT_PUBLIC_APP_SECRET;
  if (!appSecret) {
    throw new Error("Missing NEXT_PUBLIC_APP_SECRET");
  }

  // Use only APP_SECRET for shared files (no user signature)
  return CryptoJS.SHA256(appSecret + "shared").toString();
};

// 🔐 Encrypt file - Use shared key so all users can decrypt shared files
export const encryptFile = async (file: File): Promise<string> => {
  const key = getSharedEncryptionKey();

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



// 🔓 Decrypt shared file - with fallback to user-specific key for old files
export const decryptSharedFile = (encryptedData: string): string => {
  // Try shared key first (new encryption method)
  const sharedKey = getSharedEncryptionKey();

  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, sharedKey);
    const original = bytes.toString(CryptoJS.enc.Utf8);

    if (original) {
      return original;
    }
  } catch {
    // Shared key failed, will try user-specific key
  }

  // Fallback: Try decrypting with current user's key (old encryption method)
  // This allows old files to still be decrypted
  try {
    const userKey = CryptoJS.SHA256(
      process.env.NEXT_PUBLIC_APP_SECRET + "user-specific"
    ).toString();
    const bytes = CryptoJS.AES.decrypt(encryptedData, userKey);
    const original = bytes.toString(CryptoJS.enc.Utf8);

    if (original) {
      return original;
    }
  } catch {
    // Fallback also failed
  }

  throw new Error(
    "Failed to decrypt file. The file may have been corrupted or encrypted with a different key."
  );
};
