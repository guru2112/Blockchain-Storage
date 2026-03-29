import { getContract } from "@/lib/blockchain/contracts";

export interface PendingShare {
  sender: string;
  senderUsername: string;
  fileIndex: number;
  filename: string;
  timestamp: number;
}

export interface StoredFile {
  cid: string;
  filename: string;
  timestamp: number;
  folderId: number;
  fileSize: number;
}

export interface StoredFolder {
  id: number;
  name: string;
  parentId: number;
  exists: boolean;
}

export interface ConnectionDetails {
  address: string;
  username: string;
}

// --- User Profile ---

export const setUsername = async (username: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.setUsername(username);
    await tx.wait();
    console.log("✅ Username set on blockchain");
  } catch (error) {
    console.error("Failed to set username:", error);
    throw error;
  }
};

export const getUsername = async (address: string) => {
  try {
    const contract = await getContract();
    return await contract.getUsername(address);
  } catch (error) {
    console.error("Failed to fetch username:", error);
    return "";
  }
};

// --- File & Folder Management ---

export const uploadToBlockchain = async (cid: string, filename: string, folderId: number, fileSize: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.uploadFile(cid, filename, folderId, fileSize);
    await tx.wait();
    console.log("✅ Stored on blockchain");
  } catch (error) {
    console.error("Blockchain upload failed:", error);
    throw error;
  }
};

export const getFiles = async () => {
  try {
    const contract = await getContract();
    return await contract.getMyFiles();
  } catch (error) {
    console.error("Fetching files failed:", error);
    return [];
  }
};

export const renameFile = async (index: number, newName: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.renameFile(index, newName);
    await tx.wait();
    console.log("✅ File renamed");
  } catch (error) {
    console.error("Failed to rename file:", error);
    throw error;
  }
};

export const deleteFromBlockchain = async (index: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.deleteFile(index);
    await tx.wait();
    console.log("✅ Deleted from blockchain");
  } catch (error) {
    console.error("Failed to delete file:", error);
    throw error;
  }
};

export const createFolder = async (name: string, parentId: number = 0) => {
  try {
    const contract = await getContract();
    const tx = await contract.createFolder(name, parentId);
    await tx.wait();
    console.log("✅ Folder created");
  } catch (error) {
    console.error("Failed to create folder:", error);
    throw error;
  }
};

export const getFolders = async () => {
  try {
    const contract = await getContract();
    return await contract.getMyFolders();
  } catch (error) {
    console.error("Failed to fetch folders:", error);
    return [];
  }
};

export const renameFolder = async (folderId: number, newName: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.renameFolder(folderId, newName);
    await tx.wait();
    console.log("✅ Folder renamed");
  } catch (error) {
    console.error("Failed to rename folder:", error);
    throw error;
  }
};

export const deleteFolder = async (folderId: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.deleteFolder(folderId);
    await tx.wait();
    console.log("✅ Folder deleted");
  } catch (error) {
    console.error("Failed to delete folder:", error);
    throw error;
  }
};

// --- Connection Functions ---

export const sendConnectionRequest = async (address: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.sendConnectionRequest(address);
    await tx.wait();
  } catch (error) {
    console.error("Failed to send connection request:", error);
    throw error;
  }
};

export const acceptConnectionRequest = async (address: string) => {
  try {
    const contract = await getContract();
    const tx = await contract.acceptConnectionRequest(address);
    await tx.wait();
  } catch (error) {
    console.error("Failed to accept connection request:", error);
    throw error;
  }
};

export const getPendingConnectionRequests = async (): Promise<ConnectionDetails[]> => {
  try {
    const contract = await getContract();
    const addresses = await contract.getPendingConnectionRequests();
    return await Promise.all(addresses.map(async (addr: string) => {
      const name = await contract.getUsername(addr);
      return { address: addr, username: name || addr };
    }));
  } catch (error) {
    console.error("Failed to fetch pending connection requests:", error);
    return [];
  }
};

export const getConnections = async (): Promise<ConnectionDetails[]> => {
  try {
    const contract = await getContract();
    const addresses = await contract.getConnections();
    return await Promise.all(addresses.map(async (addr: string) => {
      const name = await contract.getUsername(addr);
      return { address: addr, username: name || addr };
    }));
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    return [];
  }
};

// --- Sharing Functions ---

export const sharePendingFileWith = async (recipient: string, fileIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.sharePendingFileWith(recipient, fileIndex);
    await tx.wait();
  } catch (error) {
    console.error("Failed to share file:", error);
    throw error;
  }
};

export const getPendingShares = async (): Promise<PendingShare[]> => {
  try {
    const contract = await getContract();
    const shares = await contract.getPendingShares();
    
    return await Promise.all(shares.map(async (share: any) => {
      let filename = "Unknown File";
      let senderUsername = share.sender;
      
      try {
        const fileInfo = await contract.getFileByIndex(share.sender, share.fileIndex);
        filename = fileInfo.filename;
        const uname = await contract.getUsername(share.sender);
        if (uname) senderUsername = uname;
      } catch (err) {
        console.error("Could not fetch details for shared file", err);
      }
      
      return {
        sender: share.sender,
        senderUsername,
        fileIndex: share.fileIndex,
        filename,
        timestamp: share.timestamp
      };
    }));
  } catch (error) {
    console.error("Failed to fetch pending shares:", error);
    return [];
  }
};

export const acceptPendingShare = async (sender: string, shareIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.acceptPendingShare(sender, shareIndex);
    await tx.wait();
  } catch (error) {
    console.error("Failed to accept pending share:", error);
    throw error;
  }
};

export const rejectPendingShare = async (shareIndex: number) => {
  try {
    const contract = await getContract();
    const tx = await contract.rejectPendingShare(shareIndex);
    await tx.wait();
  } catch (error) {
    console.error("Failed to reject pending share:", error);
    throw error;
  }
};

export const getSharedFiles = async (owner: string) => {
  try {
    const contract = await getContract();
    return await contract.getSharedFiles(owner);
  } catch (error) {
    console.error("Failed to fetch shared files:", error);
    return [];
  }
};

export const getStorageInfo = async (walletAddress: string) => {
  try {
    const contract = await getContract(); 
    const used = await contract.usedStorage(walletAddress);
    let limit = await contract.storageLimit(walletAddress);
    
    if (Number(limit) === 0) {
      limit = 262144000; 
    }

    return {
      used: Number(used),
      limit: Number(limit),
    };
  } catch (error) {
    console.error("Error fetching storage info:", error);
    return { used: 0, limit: 262144000 }; 
  }
};