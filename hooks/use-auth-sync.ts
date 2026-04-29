"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export function useAuthSync() {
  const router = useRouter();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "logout-event") {
        const store = useAuthStore.getState();
        store.clearUser();
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }

      if (
        event.key === "kaiross-auth-storage" &&
        event.newValue !== event.oldValue
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);
}
