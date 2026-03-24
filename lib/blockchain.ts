import { getContract } from "@/lib/contracts";

export type StoredFile = {
  cid: string;
  filename: string;
  timestamp: number;
};

// Upload CID to blockchain
export const uploadToBlockchain = async (
  cid: string,
  filename: string
) => {
  try {
    if (!cid || !filename) {
      throw new Error("Invalid CID or filename");
    }

    const contract = await getContract();

    const tx = await contract.uploadFile(cid, filename);
    await tx.wait();

    console.log("✅ Stored on blockchain");
  } catch (error) {
    console.error("Blockchain upload failed:", error);
    throw error;
  }
};

export const deleteFromBlockchain = async (index: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.deleteFile(index);
    await tx.wait();
  } catch (error) {
    console.error("Blockchain delete failed:", error);
    throw error;
  }
};

// Fetch user files
export const getFiles = async (): Promise<StoredFile[]> => {
  const contract = await getContract();
  const files = await contract.getMyFiles();

  return files.map((file: { cid: string; filename: string; timestamp: bigint }) => ({
    cid: file.cid,
    filename: file.filename,
    timestamp: Number(file.timestamp),
  }));
};
