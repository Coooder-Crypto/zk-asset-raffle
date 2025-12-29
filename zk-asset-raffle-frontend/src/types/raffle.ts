// Shared types for raffle assets and tickets

export interface Ticket {
  id: string;
  commitment: string;
  secret: string;
  claimed: boolean;
  claimedBy?: string;
  isWinner?: boolean;
  winningTier?: number;
  txHash?: string;
  revealTime?: string;
}

export interface Prize {
  name: string;
  quantity: number;
  winningPercentage?: number;
  revealTime?: string;
}

export interface Asset {
  id: string;
  prizes: Prize[];
  tickets: Ticket[];
  createdAt: string;
}

