
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
// import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "zkAssetRaffle",
  description: "Fair, verifiable raffles for real‑world assets using zero‑knowledge proofs.",
  applicationName: "zkAssetRaffle",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["zk", "raffle", "RWA", "blockchain", "zero-knowledge"],
};
