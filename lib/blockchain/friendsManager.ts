import { getContract } from "@/lib/blockchain/contracts";

export type FriendRequest = {
  requester: string;
  timestamp: number;
};

// Send a friend request to another user by wallet address
export const sendFriendRequest = async (recipientAddress: string): Promise<void> => {
  try {
    if (!recipientAddress || recipientAddress.trim() === "") {
      throw new Error("Recipient address cannot be empty");
    }

    // Basic validation for Ethereum address format
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
      throw new Error("Invalid Ethereum address format");
    }

    const contract = await getContract();
    const tx = await contract.sendFriendRequest(recipientAddress);
    await tx.wait();
    console.log("✅ Friend request sent");
  } catch (error) {
    console.error("Friend request failed:", error);
    throw error;
  }
};

// Get all pending friend requests for current user
export const getPendingFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const contract = await getContract();
    const requests = await contract.getPendingFriendRequests();

    return requests.map((req: { requester: string; timestamp: bigint }) => ({
      requester: req.requester,
      timestamp: Number(req.timestamp),
    }));
  } catch (error) {
    console.error("Failed to get pending friend requests:", error);
    return [];
  }
};

// Accept a friend request from a specific user
export const acceptFriendRequest = async (requesterAddress: string): Promise<void> => {
  try {
    if (!requesterAddress || requesterAddress.trim() === "") {
      throw new Error("Requester address cannot be empty");
    }

    const contract = await getContract();
    const tx = await contract.acceptFriendRequest(requesterAddress);
    await tx.wait();
    console.log("✅ Friend request accepted");
  } catch (error) {
    console.error("Friend request acceptance failed:", error);
    throw error;
  }
};

// Reject a friend request from a specific user
export const rejectFriendRequest = async (requesterAddress: string): Promise<void> => {
  try {
    if (!requesterAddress || requesterAddress.trim() === "") {
      throw new Error("Requester address cannot be empty");
    }

    const contract = await getContract();
    const tx = await contract.rejectFriendRequest(requesterAddress);
    await tx.wait();
    console.log("✅ Friend request rejected");
  } catch (error) {
    console.error("Friend request rejection failed:", error);
    throw error;
  }
};

// Get current user's friends list
export const getFriendsList = async (): Promise<string[]> => {
  try {
    const contract = await getContract();
    const friends = await contract.getFriendsList();
    return friends;
  } catch (error) {
    console.error("Failed to get friends list:", error);
    return [];
  }
};

// Check if two users are friends
export const areFriends = async (userAddress: string): Promise<boolean> => {
  try {
    if (!userAddress || userAddress.trim() === "") {
      return false;
    }

    const contract = await getContract();
    const result = await contract.areFriends(userAddress);
    return result;
  } catch (error) {
    console.error("Failed to check friendship status:", error);
    return false;
  }
};

// Remove a friend from your list (one-way removal)
export const removeFriend = async (friendAddress: string): Promise<void> => {
  try {
    if (!friendAddress || friendAddress.trim() === "") {
      throw new Error("Friend address cannot be empty");
    }

    const contract = await getContract();
    const tx = await contract.removeFriend(friendAddress);
    await tx.wait();
    console.log("✅ Friend removed");
  } catch (error) {
    console.error("Friend removal failed:", error);
    throw error;
  }
};

// Get friend count for current user
export const getFriendCount = async (): Promise<number> => {
  try {
    const contract = await getContract();
    const count = await contract.getFriendCount();
    return Number(count);
  } catch (error) {
    console.error("Failed to get friend count:", error);
    return 0;
  }
};

// Get pending requests count for current user
export const getPendingRequestCount = async (): Promise<number> => {
  try {
    const contract = await getContract();
    const count = await contract.getPendingRequestCount();
    return Number(count);
  } catch (error) {
    console.error("Failed to get pending request count:", error);
    return 0;
  }
};

// Helper: Cache management for friends list in localStorage
const FRIENDS_CACHE_KEY = "friends_list_cache";
const PENDING_REQUESTS_CACHE_KEY = "pending_requests_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getCachedFriendsList = (): string[] | null => {
  try {
    const cached = localStorage.getItem(FRIENDS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(FRIENDS_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to get cached friends list:", error);
    return null;
  }
};

export const setCachedFriendsList = (friends: string[]): void => {
  try {
    localStorage.setItem(
      FRIENDS_CACHE_KEY,
      JSON.stringify({
        data: friends,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to cache friends list:", error);
  }
};

export const getCachedPendingRequests = (): FriendRequest[] | null => {
  try {
    const cached = localStorage.getItem(PENDING_REQUESTS_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(PENDING_REQUESTS_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to get cached pending requests:", error);
    return null;
  }
};

export const setCachedPendingRequests = (requests: FriendRequest[]): void => {
  try {
    localStorage.setItem(
      PENDING_REQUESTS_CACHE_KEY,
      JSON.stringify({
        data: requests,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to cache pending requests:", error);
  }
};

export const clearFriendsCaches = (): void => {
  try {
    localStorage.removeItem(FRIENDS_CACHE_KEY);
    localStorage.removeItem(PENDING_REQUESTS_CACHE_KEY);
  } catch (error) {
    console.error("Failed to clear friends caches:", error);
  }
};
