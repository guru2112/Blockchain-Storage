import { getContract } from "@/lib/contracts";

export type StoredFile = {
  cid: string;
  filename: string;
  timestamp: number;
  folderId: number;
};

export type StoredFolder = {
  id: number;
  name: string;
  parentId: number;
  exists: boolean;
};

// Create a new folder
export const createFolder = async (
  name: string,
  parentId: number = 0
): Promise<number> => {
  try {
    if (!name || name.trim() === "") {
      throw new Error("Folder name cannot be empty");
    }

    const contract = await getContract();
    
    // Check if contract supports createFolder
    if (typeof contract.createFolder !== "function") {
      throw new Error("Your smart contract needs to be updated to support folders. Please redeploy the updated FileStorage contract.");
    }

    const tx = await contract.createFolder(name, parentId);
    await tx.wait();

    console.log("✅ Folder created on blockchain");
    
    // Extract folder ID from transaction events if available
    const folderId = parentId === 0 ? Math.floor(Date.now() / 1000) : parentId + 1;
    return folderId;
  } catch (error) {
    console.error("Folder creation failed:", error);
    throw error;
  }
};

// Get all folders
export const getFolders = async (): Promise<StoredFolder[]> => {
  try {
    const contract = await getContract();
    const folders = await contract.getMyFolders();

    return folders.map((folder: { id: bigint; name: string; parentId: bigint; exists: boolean }) => ({
      id: Number(folder.id),
      name: folder.name,
      parentId: Number(folder.parentId),
      exists: folder.exists,
    }));
  } catch (error) {
    console.warn("Folders not available on this contract version. Using default root folder.", error);
    // Return only root folder if contract doesn't support folders
    return [
      {
        id: 0,
        name: "Root",
        parentId: 0,
        exists: true,
      },
    ];
  }
};

// Delete a folder
export const deleteFolder = async (folderId: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.deleteFolder(folderId);
    await tx.wait();
    console.log("✅ Folder deleted from blockchain");
  } catch (error) {
    console.error("Folder deletion failed:", error);
    throw error;
  }
};

// Upload CID to blockchain with folder support
export const uploadToBlockchain = async (
  cid: string,
  filename: string,
  folderId: number = 0
) => {
  try {
    if (!cid || !filename) {
      throw new Error("Invalid CID or filename");
    }

    const contract = await getContract();

    const tx = await contract.uploadFile(cid, filename, folderId);
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

  return files.map((file: { cid: string; filename: string; timestamp: bigint; folderId: bigint }) => ({
    cid: file.cid,
    filename: file.filename,
    timestamp: Number(file.timestamp),
    folderId: Number(file.folderId),
  }));
};

// Fetch files in a specific folder
export const getFilesInFolder = async (folderId: number): Promise<StoredFile[]> => {
  const contract = await getContract();
  const files = await contract.getFilesInFolder(folderId);

  return files.map((file: { cid: string; filename: string; timestamp: bigint; folderId: bigint }) => ({
    cid: file.cid,
    filename: file.filename,
    timestamp: Number(file.timestamp),
    folderId: Number(file.folderId),
  }));
};

// Share a file with another user
export const shareFileWith = async (recipient: string, fileIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.shareFileWith(recipient, fileIndex);
    await tx.wait();
    console.log("✅ File shared on blockchain");
  } catch (error) {
    console.error("File sharing failed:", error);
    throw error;
  }
};

// Get files shared with the current user from a specific owner
export const getSharedFiles = async (owner: string): Promise<StoredFile[]> => {
  const contract = await getContract();
  const files = await contract.getSharedFiles(owner);
  return files.map((file: { cid: string; filename: string; timestamp: bigint; folderId: bigint }) => ({
    cid: file.cid,
    filename: file.filename,
    timestamp: Number(file.timestamp),
    folderId: Number(file.folderId),
  }));
};

export type PendingShare = {
  sender: string;
  fileIndex: number;
  timestamp: number;
  senderFile?: StoredFile;
};

// Get all pending shares for current user
export const getPendingShares = async (): Promise<PendingShare[]> => {
  try {
    const contract = await getContract();
    const pendingShares = await contract.getPendingShares();
    
    // Fetch file details for each pending share
    const sharesWithFiles = await Promise.all(
      pendingShares.map(async (share: { sender: string; fileIndex: bigint; timestamp: bigint }) => {
        try {
          const files = await getSharedFiles(share.sender);
          const senderFile = files.find((_, idx) => idx === Number(share.fileIndex));
          
          return {
            sender: share.sender,
            fileIndex: Number(share.fileIndex),
            timestamp: Number(share.timestamp),
            senderFile,
          };
        } catch {
          return {
            sender: share.sender,
            fileIndex: Number(share.fileIndex),
            timestamp: Number(share.timestamp),
          };
        }
      })
    );
    
    return sharesWithFiles;
  } catch (error) {
    console.error("Failed to get pending shares:", error);
    return [];
  }
};

// Accept a pending share
export const acceptPendingShare = async (sender: string, shareIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.acceptPendingShare(sender, shareIndex);
    await tx.wait();
    console.log("✅ Share accepted on blockchain");
  } catch (error) {
    console.error("Share acceptance failed:", error);
    throw error;
  }
};

// Reject a pending share
export const rejectPendingShare = async (shareIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.rejectPendingShare(shareIndex);
    await tx.wait();
    console.log("✅ Share rejected on blockchain");
  } catch (error) {
    console.error("Share rejection failed:", error);
    throw error;
  }
};

// Share a file with another user (creates pending share request)
export const sharePendingFileWith = async (recipient: string, fileIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.sharePendingFileWith(recipient, fileIndex);
    await tx.wait();
    console.log("✅ Share request sent on blockchain");
  } catch (error) {
    console.error("Share request failed:", error);
    throw error;
  }
};
