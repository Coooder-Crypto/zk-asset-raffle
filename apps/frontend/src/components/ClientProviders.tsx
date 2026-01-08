"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { TrpcProvider } from "@/components/TrpcProvider";

// Load RainbowKit and Wagmi providers only on the client to avoid SSR IndexedDB access
const RainbowKitProvider = dynamic(
  () => import("@/components/RainbowKitProvider").then((m) => m.RainbowKitProvider),
  { ssr: false }
);

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TrpcProvider>
      <RainbowKitProvider>
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 pt-20 sm:pt-24 pb-8">{children}</div>
        </main>
        <Toaster />
      </RainbowKitProvider>
    </TrpcProvider>
  );
}
