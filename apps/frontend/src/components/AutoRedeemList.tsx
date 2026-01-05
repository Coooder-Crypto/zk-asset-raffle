'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { usePublicClient, useWriteContract } from 'wagmi';
import { useActivityItemsFetcher } from '@/hooks/useActivityApi';
import { CONTRACTS } from '@/config/contracts';
import { 
  RefreshCw, 
  Trophy, 
  ExternalLink, 
  CheckCircle, 
  Gift 
} from 'lucide-react';

// Types
interface Winner {
  sid: string;
  r_i: string;
  win_i: number;
  proof: string[];
  isRedeemed?: boolean;
  redeeming?: boolean;
  txHash?: string;
  error?: string;
}

interface AutoRedeemListProps {
  raffleId: string;
  winnersMap: Record<string, Winner[]>;
  setWinnersMap: React.Dispatch<React.SetStateAction<Record<string, Winner[]>>>;
  publicClient: ReturnType<typeof usePublicClient>;
  writeContractAsync: ReturnType<typeof useWriteContract>['writeContractAsync'];
  toast: ReturnType<typeof useToast>['toast'];
}

// Helper: convert SID string to bytes32 hex
function sidToBytes32(sid: string): `0x${string}` {
  if (sid.startsWith('0x')) {
    return sid.padEnd(66, '0') as `0x${string}`;
  }
  const hex = Buffer.from(sid, 'utf8').toString('hex');
  return ('0x' + hex.padEnd(64, '0')) as `0x${string}`;
}

export default function AutoRedeemList({
  raffleId,
  winnersMap,
  setWinnersMap,
  publicClient,
  writeContractAsync,
  toast,
}: AutoRedeemListProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const { fetchActivityItems } = useActivityItemsFetcher();

  const loadWinners = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await fetchActivityItems(raffleId);
      
      if (resp.status !== 'success' || !resp.items) {
        throw new Error(resp.message || 'Failed to load items');
      }

      const winners = (resp.items as Array<Record<string, unknown>>)
        .filter((it) => typeof it.win_i === 'number' && (it.win_i as number) > 0)
        .map((it) => ({
          sid: String(it.sid),
          r_i: String((it.r_i ?? '') as string),
          win_i: Number((it.win_i ?? 0) as number),
          proof: Array.isArray(it.proof)
            ? (it.proof as Array<Record<string, unknown>>).map((p) => `0x${String(p.data)}`)
            : [],
        }));

      // Check on-chain redeemed status
      if (publicClient) {
        const withRedeemed = await Promise.all(
          winners.map(async (w) => {
            try {
              const claim: unknown = await publicClient.readContract({
                address: CONTRACTS.ZK_ASSET_RAFFLE.address,
                abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
                functionName: 'getTicketClaim',
                args: [raffleId, sidToBytes32(w.sid)],
              });
              let redeemed = false;
              if (typeof claim === 'object' && claim !== null) {
                const rec = claim as Record<string, unknown>;
                if (typeof rec.isRedeemed === 'boolean') redeemed = rec.isRedeemed as boolean;
              } else if (Array.isArray(claim)) {
                const arr = claim as unknown[];
                if (typeof arr[2] === 'boolean') redeemed = arr[2] as boolean;
              }
              return { ...w, isRedeemed: redeemed };
            } catch {
              return { ...w };
            }
          })
        );
        setWinnersMap(prev => ({ ...prev, [raffleId]: withRedeemed }));
      } else {
        setWinnersMap(prev => ({ ...prev, [raffleId]: winners }));
      }
    } catch (e: unknown) {
      toast({ 
        title: 'Error', 
        description: e instanceof Error ? e.message : 'Failed to load winners', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  }, [raffleId, setWinnersMap, publicClient, toast]);

  const redeem = async (sid: string) => {
    const list = winnersMap[raffleId] || [];
    const idx = list.findIndex(w => w.sid === sid);
    if (idx < 0) return;
    
    const winner = list[idx];
    
    try {
      // Update state to show redeeming
      setWinnersMap(prev => ({
        ...prev,
        [raffleId]: prev[raffleId].map(item => 
          item.sid === sid 
            ? { ...item, redeeming: true, error: undefined } 
            : item
        )
      }));

      const tx = await writeContractAsync({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'redeemPrize',
        args: [raffleId, sidToBytes32(winner.sid), winner.r_i, winner.win_i, winner.proof as `0x${string}`[]],
      });

      if (!publicClient) {
        throw new Error('Public client unavailable');
      }

      await publicClient.waitForTransactionReceipt({ hash: tx });
      
      // Update state to show redeemed
      setWinnersMap(prev => ({
        ...prev,
        [raffleId]: prev[raffleId].map(item => 
          item.sid === sid 
            ? { ...item, redeeming: false, isRedeemed: true, txHash: tx } 
            : item
        )
      }));
      
      toast({ 
        title: 'Redeemed', 
        description: `SID ${sid} redeemed successfully`, 
        variant: 'default' 
      });
    } catch (e: unknown) {
      // Update state to show error
      setWinnersMap(prev => ({
        ...prev,
        [raffleId]: prev[raffleId].map(item => 
          item.sid === sid 
            ? { ...item, redeeming: false, error: e instanceof Error ? e.message : 'Redeem failed' } 
            : item
        )
      }));
      
      toast({ 
        title: 'Error', 
        description: e instanceof Error ? e.message : 'Redeem failed', 
        variant: 'destructive' 
      });
    }
  };

  useEffect(() => {
    if (!winnersMap[raffleId]) {
      loadWinners();
    }
  }, [raffleId, loadWinners, winnersMap]);

  const winners = winnersMap[raffleId] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          <h4 className="font-semibold text-lg">Prize Winners</h4>
        </div>
        <Button 
          variant="outline"
          className="h-9 px-3"
          onClick={loadWinners} 
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {winners.length === 0 ? (
        <Alert>
          <AlertDescription>
            No winners found or raffle not yet revealed. Check back after the reveal phase.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3">
          {winners.map((winner, index) => (
            <motion.div
              key={winner.sid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover-lift transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="font-mono">
                    SID: {winner.sid.slice(0, 8)}...
                  </Badge>
                  <Badge>Prize Level {winner.win_i}</Badge>
                </div>
                
                {winner.txHash && (
                  <a 
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors" 
                    href={`https://sepolia.etherscan.io/tx/${winner.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Tx: {winner.txHash.slice(0, 10)}...
                  </a>
                )}
                
                {winner.error && (
                  <div className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">
                    {winner.error}
                  </div>
                )}
              </div>
              
              <Button 
                variant={winner.isRedeemed ? "outline" : "gradient"}
                className="h-9 px-3"
                onClick={() => redeem(winner.sid)} 
                disabled={!!winner.isRedeemed || winner.redeeming}
              >
                {winner.isRedeemed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Redeemed
                  </>
                ) : winner.redeeming ? (
                  <>
                    <Gift className="h-4 w-4 mr-2 animate-pulse" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Redeem
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
