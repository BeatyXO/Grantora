"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { connectInjectedWallet } from "@/lib/genlayer/grantora";

type WalletContextValue = {
  address: string | null;
  pending: boolean;
  error: string | null;
  connect: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Wallet connection failed.";
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("grantora:last-wallet");
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setPending(true);
    setError(null);
    try {
      const nextAddress = await connectInjectedWallet();
      window.localStorage.setItem("grantora:last-wallet", nextAddress);
      setAddress(nextAddress);
    } catch (connectError) {
      setError(extractErrorMessage(connectError));
    } finally {
      setPending(false);
    }
  }

  const value = useMemo(() => ({ address, pending, error, connect }), [address, pending, error]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
