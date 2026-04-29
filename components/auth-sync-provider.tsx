"use client";

import { useAuthSync } from "@/hooks/use-auth-sync";

export default function AuthSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();
  return <>{children}</>;
}

export { AuthSyncProvider };
