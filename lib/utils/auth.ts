let currentWallet: string | null = null;
const SESSION_KEY = "wallet_session";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// Save wallet to localStorage with timestamp
export const setWallet = (address: string) => {
  currentWallet = address;
  if (typeof window !== "undefined") {
    const session = {
      address,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
};

// Restore wallet from localStorage if not expired
const restoreWallet = () => {
  if (typeof window === "undefined") return null;
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    if (
      typeof session.address === "string" &&
      typeof session.timestamp === "number"
    ) {
      if (Date.now() - session.timestamp < SESSION_DURATION_MS) {
        currentWallet = session.address;
        return session.address;
      } else {
        // Expired
        localStorage.removeItem(SESSION_KEY);
        currentWallet = null;
        return null;
      }
    }
  } catch {
    localStorage.removeItem(SESSION_KEY);
  }
  return null;
};

// Get wallet (restores from localStorage if needed)
export const getWallet = () => {
  if (currentWallet) return currentWallet;
  return restoreWallet();
};

export const isAuthenticated = () => {
  return Boolean(getWallet());
};

// Logout and clear session
export const logout = () => {
  currentWallet = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};

