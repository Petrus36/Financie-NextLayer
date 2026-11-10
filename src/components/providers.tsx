"use client";

import { SessionProvider } from "next-auth/react";
import { AppBackdrop } from "@/components/layout/app-backdrop";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppBackdrop />
      {children}
    </SessionProvider>
  );
}
