import { getContract } from "../lib/contracts";

// 🔗 Store file on blockchain
export const uploadToBlockchain = async (
  cid: string,
  filename: string
) => {
  try {
    const contract = await getContract();

    const tx = await contract.uploadFile(cid, filename);
    await tx.wait();

    console.log("✅ Stored on blockchain");
  } catch (error) {
    console.error("Blockchain upload failed:", error);
    throw error;
  }
};

// 📥 Fetch user files
export const getFiles = async () => {
  try {
    const contract = await getContract();

    const files = await contract.getMyFiles();

    return files;
  } catch (error) {
    console.error("Fetching files failed:", error);
    return [];
  }
};