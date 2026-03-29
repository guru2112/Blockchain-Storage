import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/utils/auth";
import { clearCachedLoginSignature } from "@/lib/utils/wallet";
import { clearEncryptionKey } from "@/lib/utils/crypto";

export const useProtectHistory = () => {
  const router = useRouter();

  useEffect(() => {
    // Push a new history state to prevent going back
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // User tried to use back/forward button - logout
      logout();
      clearCachedLoginSignature();
      clearEncryptionKey();
      router.replace("/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);
};
