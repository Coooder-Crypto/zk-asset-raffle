"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, X, Zap } from "lucide-react";
import { cn } from "@/utils/utils";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/create", label: "Create" },
  { href: "/claim", label: "Claim" },
  { href: "/admin", label: "Admin" },
];

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-[color:var(--background)]/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="w-9 h-9 gradient-bg rounded-lg inline-flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </span>
          <span className="text-lg font-semibold gradient-text group-hover:opacity-90">zkAssetRaffle</span>
        </Link>

        {/* Right cluster: nav + wallet + menu */}
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-2 mr-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="relative">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
          <div className="hidden sm:flex">
            <RainbowConnectButton />
          </div>
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                <span
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm font-medium",
                    isActive(item.href)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            ))}
            <div className="mt-3">
              <RainbowConnectButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
