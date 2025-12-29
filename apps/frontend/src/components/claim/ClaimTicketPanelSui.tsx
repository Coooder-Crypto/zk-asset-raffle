'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, Wallet } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useItemBySidFetcher } from '@/hooks/useActivityApi';
import { base64ToHex0x } from '@/utils/raffle';
import { ActionPanel } from '@/components/claim/ActionPanel';
import { Modal } from '@/components/ui/modal';
import type { QRCodeClaimProps } from '@/components/claim/types';
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { fetchSuiRaffle, fetchSuiTicketClaim, waitForSuiTransaction, buildClaimTicketTx, buildRedeemPrizeTx } from '@/lib/sui/raffle';
import { parseSuiRaffle, parseSuiTicketClaim } from '@/lib/sui/parsers';

export function ClaimTicketPanelSui({ qrData, onClaimSuccess }: QRCodeClaimProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [onChainStatus, setOnChainStatus] = useState<{
    isClaimed: boolean;
    isRedeemed: boolean;
    canRedeem: boolean;
  } | null>(null);
  //

  const { toast } = useToast();
  const { fetchItemBySid } = useItemBySidFetcher();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransactionBlock();
  const [redeemInfo, setRedeemInfo] = useState<{ open: boolean; winLevel: number; txHash?: string } | null>(null);

  // Determine raffleId from payload
  const raffleId = qrData.raffleId || qrData.activity_id;

  // Read on-chain raffle state to guide UX
  const [raffleState, setRaffleState] = useState<number | null>(null);

  // Helper function to get state display text
  //

  // Check on-chain status for this ticket
  const checkOnChainStatus = React.useCallback(async () => {
    if (!raffleId) return;

    setIsCheckingStatus(true);
    try {
      const [raffleData, claimData] = await Promise.all([
        fetchSuiRaffle(suiClient, raffleId),
        fetchSuiTicketClaim(suiClient, raffleId, qrData.sid),
      ]);

      const parsedRaffle = parseSuiRaffle(raffleData);
      const parsedClaim = parseSuiTicketClaim(claimData);

      const stateValue = parsedRaffle?.state ?? 0;
      setRaffleState(stateValue);

      const isClaimed = Boolean(parsedClaim?.claimer);
      const isRedeemed = Boolean(parsedClaim?.isRedeemed);
      const canRedeem = stateValue === 2;

      setOnChainStatus({ isClaimed, isRedeemed, canRedeem });
    } catch (error) {
      console.error('Failed to check Sui status:', error);
      toast({
        title: 'Error',
        description: 'Failed to check ticket status on Sui',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  }, [raffleId, qrData.sid, suiClient, toast]);

  // Auto-check status when component loads
  React.useEffect(() => {
    if (raffleId) {
      checkOnChainStatus();
    }
  }, [raffleId, checkOnChainStatus]);

  const handleClaim = async () => {
    if (!account) {
      toast({
        title: 'Error',
        description: 'Connect your Sui wallet before claiming',
        variant: 'destructive',
      });
      return;
    }

    if (!raffleId) {
      toast({
        title: 'Error',
        description: 'Missing raffle identifier in QR data',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const encryptedPayload = base64ToHex0x(qrData.encrypted_data);
      const tx = buildClaimTicketTx(raffleId, qrData.sid, encryptedPayload);
      const result = await signAndExecute({ transactionBlock: tx, options: { showEffects: true } });

      if (!result.digest) {
        throw new Error('Transaction digest missing for Sui claim');
      }

      await waitForSuiTransaction(suiClient, result.digest);

      if (onClaimSuccess) {
        onClaimSuccess({
          success: true,
          message: 'Claim submitted on Sui network.',
          txHash: result.digest,
        });
      }

      toast({
        title: 'Claim Submitted',
        description: `Digest: ${result.digest.slice(0, 12)}...`,
      });

      await checkOnChainStatus();

    } catch (error) {
      console.error('Claim error on Sui:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim on Sui';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle redeem (fetch proof from backend and redeem)
  const handleRedeem = async () => {
    if (!account) {
      toast({
        title: 'Error',
        description: 'Connect your Sui wallet before redeeming',
        variant: 'destructive',
      });
      return;
    }

    if (!raffleId) {
      toast({
        title: 'Error',
        description: 'Missing raffle identifier in QR data',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const itemResponse = await fetchItemBySid(raffleId, qrData.sid);

      if (itemResponse.status !== 'success' || !itemResponse.r_i || typeof itemResponse.win_i !== 'number') {
        throw new Error(itemResponse.message || 'Raffle not revealed or ticket data unavailable');
      }

      const formattedProof = Array.isArray(itemResponse.proof)
        ? itemResponse.proof.map((p) => `0x${p.data}`)
        : [];

      const redeemTx = buildRedeemPrizeTx(
        raffleId,
        qrData.sid,
        itemResponse.r_i,
        itemResponse.win_i,
        formattedProof,
      );

      const result = await signAndExecute({ transactionBlock: redeemTx, options: { showEffects: true } });

      if (!result.digest) {
        throw new Error('Transaction digest missing for Sui redeem');
      }

      await waitForSuiTransaction(suiClient, result.digest);
      await checkOnChainStatus();

      toast({
        title: 'Redeemed',
        description: `Digest: ${result.digest.slice(0, 12)}...`,
      });

      setRedeemInfo({ open: true, winLevel: itemResponse.win_i, txHash: result.digest });
    } catch (error) {
      console.error('Redeem error on Sui:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to redeem on Sui';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
          <TicketIcon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Ticket Ready</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          SID: <span className="font-mono">{qrData.sid.slice(0, 8)}...</span>
          {raffleId ? (
            <> · Raffle: <span className="font-mono">{(raffleId as string).slice(0, 8)}...</span></>
          ) : null}
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <ActionPanel
            status={onChainStatus}
            isProcessing={isProcessing}
            isChecking={isCheckingStatus}
            onClaim={handleClaim}
            onRedeem={handleRedeem}
            onRefresh={checkOnChainStatus}
            canClaim={Boolean(raffleId) && (raffleState === 1 || raffleState === 2)}
          />

          {!account && (
            <div className="text-center p-3 bg-accent/5 border border-accent/20 rounded-lg text-muted-foreground text-sm">
              <div className="inline-flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Please connect your Sui wallet to proceed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Redeem result modal */}
      <Modal
        open={Boolean(redeemInfo?.open)}
        onClose={() => setRedeemInfo(null)}
        title={redeemInfo && redeemInfo.winLevel > 0 ? 'Congratulations!' : 'Result'}
        maxWidthClass="max-w-md"
      >
        {redeemInfo && (
          <div className="relative overflow-hidden">
            {redeemInfo.winLevel > 0 ? (
              <div className="space-y-4 text-center">
                <div className="text-4xl">🎉🎊✨</div>
                <h3 className="text-xl font-bold gradient-text">You won Prize Level {redeemInfo.winLevel}!</h3>
                <p className="text-sm text-muted-foreground">Your redemption is recorded on-chain.</p>
              </div>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-3xl">🙂</div>
                <h3 className="text-lg font-semibold">No prize this time</h3>
                <p className="text-sm text-muted-foreground">Redemption recorded on-chain. Better luck next time!</p>
              </div>
            )}
            {redeemInfo.txHash && (
              <div className="mt-4 text-center text-xs">
                <a
                  className="underline text-accent"
                  href={`https://suiexplorer.com/txblock/${redeemInfo.txHash}?network=${process.env.NEXT_PUBLIC_SUI_EXPLORER_NETWORK || 'testnet'}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on Sui Explorer
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
