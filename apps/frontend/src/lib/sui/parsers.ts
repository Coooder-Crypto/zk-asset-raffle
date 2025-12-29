export interface SuiRaffleState {
  state: number;
  creator?: string;
  keyRevealed?: boolean;
}

export interface SuiTicketClaimState {
  claimer?: string;
  isRedeemed?: boolean;
}

export function parseSuiRaffle(data: unknown): SuiRaffleState | null {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const stateValue = record.state ?? record.result?.state;
  const creatorValue = record.creator ?? record.result?.creator;
  const keyRevealedValue = record.keyRevealed ?? record.result?.key_revealed ?? record.result?.keyRevealed;

  return {
    state: typeof stateValue === 'number' ? stateValue : Number(stateValue ?? 0),
    creator: typeof creatorValue === 'string' ? creatorValue : undefined,
    keyRevealed: typeof keyRevealedValue === 'boolean' ? keyRevealedValue : Boolean(keyRevealedValue),
  };
}

export function parseSuiTicketClaim(data: unknown): SuiTicketClaimState | null {
  if (!data || typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const claimerValue = record.claimer ?? record.result?.claimer;
  const redeemedValue = record.isRedeemed ?? record.result?.is_redeemed ?? record.result?.isRedeemed;

  return {
    claimer: typeof claimerValue === 'string' ? claimerValue : undefined,
    isRedeemed: typeof redeemedValue === 'boolean' ? redeemedValue : Boolean(redeemedValue),
  };
}
