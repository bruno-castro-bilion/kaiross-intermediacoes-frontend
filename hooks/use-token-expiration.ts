"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

const TOKEN_LIFETIME_MS = 90 * 60 * 1000;
const WARNING_TIME_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 10 * 1000;

export const TOKEN_ISSUED_AT_KEY = "kaiross-token-issued-at";

export function useTokenExpiration() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(WARNING_TIME_MS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const { user, logout } = useAuthStore();
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const forceLogout = useCallback(() => {
    stopPolling();
    setShowWarning(false);
    logout();
    routerRef.current.push("/login");
  }, [logout, stopPolling]);

  const checkTokenStatus = useCallback(() => {
    if (!user) return;

    const issuedAt = localStorage.getItem(TOKEN_ISSUED_AT_KEY);
    if (!issuedAt) {
      fetch("/api/auth/refresh", { method: "POST", credentials: "include" })
        .then((res) => {
          if (res.ok) {
            localStorage.setItem(TOKEN_ISSUED_AT_KEY, Date.now().toString());
          } else {
            forceLogout();
          }
        })
        .catch(() => forceLogout());
      return;
    }

    const elapsed = Date.now() - Number(issuedAt);
    const remaining = TOKEN_LIFETIME_MS - elapsed;

    if (elapsed >= TOKEN_LIFETIME_MS) {
      forceLogout();
    } else if (elapsed >= TOKEN_LIFETIME_MS - WARNING_TIME_MS) {
      setShowWarning(true);
      setTimeRemaining(Math.max(0, remaining));

      if (!countdownRef.current) {
        countdownRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1000) {
              if (countdownRef.current) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
              }
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);
      }
    } else {
      setShowWarning(false);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
  }, [user, forceLogout]);

  const startPolling = useCallback(() => {
    stopPolling();
    checkTokenStatus();
    intervalRef.current = setInterval(checkTokenStatus, POLL_INTERVAL_MS);
  }, [checkTokenStatus, stopPolling]);

  const refreshToken = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.setItem(TOKEN_ISSUED_AT_KEY, Date.now().toString());
        setShowWarning(false);
        setTimeRemaining(WARNING_TIME_MS);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        startPolling();
        return true;
      } else {
        forceLogout();
        return false;
      }
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      forceLogout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [forceLogout, startPolling]);

  const handleLogout = useCallback(() => {
    stopPolling();
    setShowWarning(false);
    logout();
    routerRef.current.push("/login");
  }, [stopPolling, logout]);

  const handleContinue = useCallback(async () => {
    await refreshToken();
  }, [refreshToken]);

  const notifyOtherTabs = useCallback(() => {
    const current = localStorage.getItem(TOKEN_ISSUED_AT_KEY);
    if (current) {
      localStorage.setItem(TOKEN_ISSUED_AT_KEY, current);
    }
  }, []);

  useEffect(() => {
    if (user) {
      startPolling();
    } else {
      stopPolling();
      setShowWarning(false);
    }
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        checkTokenStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, checkTokenStatus]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_ISSUED_AT_KEY && user) {
        checkTokenStatus();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user, checkTokenStatus]);

  return {
    showWarning,
    timeRemaining,
    isRefreshing,
    handleContinue,
    handleLogout,
    refreshToken,
    notifyOtherTabs,
  };
}
