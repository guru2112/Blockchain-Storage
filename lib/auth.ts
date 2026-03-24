const STORAGE_KEY = "wallet_address";

// ✅ Save wallet
export const setWallet = (address: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, address);
};

// ✅ Get wallet (persistent)
export const getWallet = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const isAuthenticated = () => {
  return Boolean(getWallet());
};

// ✅ Logout
export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};
