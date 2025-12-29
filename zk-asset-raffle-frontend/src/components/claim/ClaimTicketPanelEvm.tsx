'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket as TicketIcon, Wallet } from 'lucide-react';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useToast } from '@/components/ui/use-toast';
import { CONTRACTS } from '@/config/contracts';
import { apiService } from '@/utils/api-service';
import { sidToBytes32, base64ToHex0x } from '@/utils/raffle';
import { ActionPanel } from '@/components/claim/ActionPanel';
import { Modal } from '@/components/ui/modal';
import type { QRCodeClaimProps } from '@/components/claim/types';

export function ClaimTicketPanelEvm({ qrData, onClaimSuccess }: QRCodeClaimProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [onChainStatus, setOnChainStatus] = useState<{
    isClaimed: boolean;
    isRedeemed: boolean;
    canRedeem: boolean;
  } | null>(null);
  //

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const [redeemInfo, setRedeemInfo] = useState<{ open: boolean; winLevel: number; txHash?: `0x${string}` } | null>(null);

  // Determine raffleId from payload
  const raffleId = qrData.raffleId || qrData.activity_id;

  // Read on-chain raffle state to guide UX
  const { data: raffleData } = useReadContract({
    address: CONTRACTS.ZK_ASSET_RAFFLE.address,
    abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
    functionName: 'getRaffle',
    args: [raffleId || ''],
  } as const);
  
  const raffleState: number | null = raffleData && typeof (raffleData as Record<string, unknown>).state !== 'undefined'
    ? Number((raffleData as Record<string, unknown>).state as number)
    : null;

  // Helper function to get state display text
  //

  // Check on-chain status for this ticket
  const checkOnChainStatus = React.useCallback(async () => {
    if (!raffleId || !publicClient) return;

    setIsCheckingStatus(true);
    try {
      // Convert sid to bytes32 format
      const sidBytes32: string = sidToBytes32(qrData.sid);

      // Check ticket claim status
      const claimData: unknown = await publicClient.readContract({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'getTicketClaim',
        args: [raffleId, sidBytes32],
      });

      // claimData is TicketClaim { claimer, encryptedData, isRedeemed, claimedAt }
      let claimer: string | undefined;
      let isRedeemed = false;
      if (typeof claimData === 'object' && claimData !== null) {
        const rec = claimData as Record<string, unknown>;
        if (typeof rec.claimer === 'string') claimer = rec.claimer;
        if (typeof rec.isRedeemed === 'boolean') isRedeemed = rec.isRedeemed as boolean;
      } else if (Array.isArray(claimData)) {
        const arr = claimData as unknown[];
        if (typeof arr[0] === 'string') claimer = arr[0] as string;
        if (typeof arr[2] === 'boolean') isRedeemed = arr[2] as boolean;
      }
      const isClaimed = Boolean(claimer && claimer !== '0x0000000000000000000000000000000000000000');

      // Only allow redeem when raffle is Revealed (state === 2)
      const canRedeem = raffleState === 2;

      setOnChainStatus({
        isClaimed,
        isRedeemed,
        canRedeem
      });

      //

    } catch (error) {
      console.error('Failed to check on-chain status:', error);
      toast({
        title: "Error",
        description: "Failed to check ticket status on-chain",
        variant: "destructive",
      });
    } finally {
      setIsCheckingStatus(false);
    }
  }, [raffleId, publicClient, qrData.sid, raffleState, toast]);

  // Auto-check status when component loads
  React.useEffect(() => {
    if (raffleId && publicClient && raffleState !== null) {
      checkOnChainStatus();
    }
  }, [raffleId, publicClient, raffleState, checkOnChainStatus]);

  const handleClaim = async () => {
    if (!isConnected || !address) {
      if (openConnectModal) {
        openConnectModal();
        return;
      } else {
        toast({
          title: "Error",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Convert sid and encrypted data to on-chain formats
      const sidBytes32: string = sidToBytes32(qrData.sid);
      const encryptedDataBytes = base64ToHex0x(qrData.encrypted_data);

      const raffleId = qrData.raffleId || qrData.activity_id;
      if (!raffleId) {
        throw new Error('Missing raffleId/activity_id in QR data');
      }
      
      // Call the claimTicket function on the ZkAssetRaffle contract
      const hash = await writeContractAsync({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'claimTicket',
        args: [raffleId, sidBytes32, encryptedDataBytes] // raffleId, ticketId, encryptedData
      });


      // Wait for transaction confirmation
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      await publicClient.waitForTransactionReceipt({ hash });

      // Get updated raffle state after claim
      const updatedRaffleData: unknown = await publicClient.readContract({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'getRaffle',
        args: [raffleId]
      });
      let updatedState = 0;
      if (typeof updatedRaffleData === 'object' && updatedRaffleData !== null) {
        const rec = updatedRaffleData as Record<string, unknown>;
        if (typeof rec.state !== 'undefined') {
          updatedState = Number(rec.state as number);
        }
      } else if (Array.isArray(updatedRaffleData)) {
        updatedState = Number((updatedRaffleData as unknown[])[3] as number);
      }

      const result = {
        success: true,
        message: updatedState === 2 
          ? 'Claimed! Raffle revealed — check and redeem.'
          : updatedState === 3
          ? 'Claimed! Raffle closed — check result.'
          : 'Claimed! Waiting for reveal to see result.',
        txHash: hash
      };

      if (onClaimSuccess) {
        onClaimSuccess(result);
      }

      // Refresh on-chain ticket status after successful claim
      await checkOnChainStatus();

      toast({
        title: "Claim submitted",
        description: `Tx: ${result.txHash.substring(0, 10)}... (view on Etherscan)`,
        variant: "success",
      });

    } catch (error) {
      console.error('Claim error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to claim';

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle redeem (fetch proof from backend and redeem)
  const handleRedeem = async () => {
    if (!isConnected || !address) {
      if (openConnectModal) {
        openConnectModal();
        return;
      } else {
        toast({
          title: "Error",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Fetch proof and win data from backend
      const itemResponse = await apiService.getItemBySid(raffleId as string, qrData.sid);
      
      if (itemResponse.status !== 'success' || !itemResponse.r_i || typeof itemResponse.win_i !== 'number') {
        throw new Error('Raffle not yet revealed or item data not available');
      }

      const { r_i, win_i, proof } = itemResponse;
      
      // Convert proof format
      const formattedProof = proof ? proof.map(p => `0x${p.data}`) : [];

      // Convert sid to bytes32 format
      const sidBytes32: string = sidToBytes32(qrData.sid);

      // Call redeemPrize function
      const hash = await writeContractAsync({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'redeemPrize',
        args: [
          raffleId,        // raffleId
          sidBytes32,      // ticketId  
          r_i,             // secretValue
          win_i,           // prizeLevel
          formattedProof   // merkleProof
        ]
      });


      // Wait for transaction confirmation
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      await publicClient.waitForTransactionReceipt({ hash });

      // Update on-chain status
      await checkOnChainStatus();

      toast({
        title: "Redeem success",
        description: `Tx: ${hash.substring(0, 10)}... (view on Etherscan)`,
        variant: "success",
      });

      setRedeemInfo({ open: true, winLevel: win_i, txHash: hash });

    } catch (error) {
      console.error('Redeem error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to redeem';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
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

          {!isConnected && (
            <div className="text-center p-3 bg-accent/5 border border-accent/20 rounded-lg text-muted-foreground text-sm">
              <div className="inline-flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Please connect your wallet to proceed
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
                  href={`https://sepolia.etherscan.io/tx/${redeemInfo.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View transaction
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
