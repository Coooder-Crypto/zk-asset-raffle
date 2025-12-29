"use client";

import { useCallback, useEffect, useState } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { fetchSuiRaffle, fetchSuiTicketClaim } from '@/lib/sui/raffle';
import { parseSuiRaffle, parseSuiTicketClaim, SuiRaffleState, SuiTicketClaimState } from '@/lib/sui/parsers';

export function useSuiRaffleState(raffleId?: string) {
  const client = useSuiClient();
  const [data, setData] = useState<SuiRaffleState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!raffleId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSuiRaffle(client, raffleId);
      setData(parseSuiRaffle(result));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load raffle state';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client, raffleId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}

export function useSuiTicketClaim(raffleId?: string, sid?: string) {
  const client = useSuiClient();
  const [data, setData] = useState<SuiTicketClaimState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!raffleId || !sid) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSuiTicketClaim(client, raffleId, sid);
      setData(parseSuiTicketClaim(result));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load ticket state';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [client, raffleId, sid]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
