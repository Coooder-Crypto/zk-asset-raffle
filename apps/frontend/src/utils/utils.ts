import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketId(length: number = 10): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function generateCommitment(secret: string, ticketId: string): string {
  // In a real implementation, this would use a cryptographic hash function
  // For this demo, we'll use a simple string concatenation and hash simulation
  const combined = ticketId + secret;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}

export function isWinner(commitment: string, revealValue: string, winningThreshold: number = 0.2): boolean {
  // In a real implementation, this would verify the commitment matches the reveal
  // and use a deterministic way to determine winners
  // For this demo, we'll use a simple hash-based approach
  
  // Convert last 8 chars of commitment to number and normalize to 0-1 range
  const hashValue = parseInt(commitment.slice(-8), 16) / 0xffffffff;
  return hashValue < winningThreshold;
}

/**
 * Determine which prize tier a ticket wins (if any)
 * @param commitment - The ticket commitment hash
 * @param revealValue - The secret value used to reveal
 * @param prizeTiers - Array of prize tiers with winning percentages
 * @returns The index of the winning prize tier, or -1 if not a winner
 */
export function determineWinningTier(commitment: string, revealValue: string, prizeTiers: { winningPercentage?: number }[]): number {
  // Convert last 8 chars of commitment to number and normalize to 0-1 range
  const hashValue = parseInt(commitment.slice(-8), 16) / 0xffffffff;
  
  // Check each prize tier in order (from highest to lowest)
  let cumulativePercentage = 0;
  
  for (let i = 0; i < prizeTiers.length; i++) {
    // Use default of 0.2 (20%) if winningPercentage is not defined
    const percentage = prizeTiers[i].winningPercentage ?? 0.2;
    cumulativePercentage += percentage;
    if (hashValue < cumulativePercentage) {
      return i; // Winner of this tier
    }
  }
  
  return -1; // Not a winner
}

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}
