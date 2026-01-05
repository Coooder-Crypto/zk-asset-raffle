'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';
import { useAccount, useWriteContract, usePublicClient, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useToast } from '@/components/ui/use-toast';
import { CONTRACTS } from '@/config/contracts';
import { useRevealActivity } from '@/hooks/useActivityApi';
import type { RevealKeyComponentProps } from '@/components/reveal/types';

export function RevealKeyDialogEvm({ raffleId, onRevealSuccess }: RevealKeyComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealResult, setRevealResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
  } | null>(null);

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { toast } = useToast();
  const { revealActivity } = useRevealActivity();

  // Read contract state to check current raffle status
  const { data: raffleData } = useReadContract({
    address: CONTRACTS.ZK_ASSET_RAFFLE.address,
    abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
    functionName: 'getRaffle',
    args: [raffleId],
  });

  const handleRevealKey = async () => {
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
    setRevealResult(null);

    try {
      // 1) Fetch encryption key from backend and mark backend as revealed
      const resp = await revealActivity(raffleId);
      if (resp.status !== 'success' || !resp.key) {
        throw new Error(resp.message || 'Failed to obtain encryption key from backend');
      }
      const encryptionKey = resp.key;

      // 2) Reveal on-chain using the fetched key
      const hash = await writeContractAsync({
        address: CONTRACTS.ZK_ASSET_RAFFLE.address,
        abi: CONTRACTS.ZK_ASSET_RAFFLE.abi,
        functionName: 'revealKey',
        args: [
          raffleId,        // raffleId
          encryptionKey    // encryptionKey (string)
        ]
      });


      // Wait for transaction confirmation
      if (!publicClient) {
        throw new Error('Public client is not available');
      }

      await publicClient.waitForTransactionReceipt({ hash });

      const result = {
        success: true,
        message: 'Encryption key revealed on-chain. Participants can redeem.',
        txHash: hash
      };

      setRevealResult(result);

      if (onRevealSuccess) {
        onRevealSuccess(result);
      }

      toast({
        title: "Reveal success",
        description: (
          <a
            href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View Transaction: {result.txHash.substring(0, 10)}...
          </a>
        ),
        variant: "success",
      });

    } catch (error) {
      console.error('Reveal key error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reveal key';
      
      setRevealResult({
        success: false,
        message: errorMessage
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if the user is the raffle creator
  const isRaffleCreator = raffleData && address && raffleData.creator?.toLowerCase() === address.toLowerCase();
  const currentState = raffleData ? raffleData.state : null;
  const keyAlreadyRevealed = raffleData ? raffleData.keyRevealed : false;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Reveal Encryption Key</h3>
            </div>
            <p className="text-sm text-gray-600">
              As the raffle creator, reveal the encryption key so participants can decrypt their winning information
            </p>
          </div>

          {/* Access Control Messages */}
          {!isConnected && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Please connect your wallet to reveal the encryption key
              </AlertDescription>
            </Alert>
          )}

          {isConnected && !isRaffleCreator && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Only the raffle creator can reveal the encryption key
              </AlertDescription>
            </Alert>
          )}

          {isConnected && isRaffleCreator && currentState !== 1 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Raffle must be in &quot;Committed&quot; state to reveal the key. Current state: {
                  currentState === 0 ? 'Created (need to commit first)' :
                  currentState === 2 ? 'Already Revealed' :
                  currentState === 3 ? 'Closed' : 'Unknown'
                }
              </AlertDescription>
            </Alert>
          )}

          {keyAlreadyRevealed && (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Encryption key has already been revealed for this raffle
              </AlertDescription>
            </Alert>
          )}

          {/* One-click Reveal */}
          {isConnected && isRaffleCreator && currentState === 1 && !keyAlreadyRevealed && (
            <Button 
              onClick={handleRevealKey}
              disabled={isProcessing || !!revealResult?.success}
              className="w-full"
              variant="gradient"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revealing Key...
                </>
              ) : revealResult?.success ? (
                'Key Revealed Successfully!'
              ) : (
                'Reveal'
              )}
            </Button>
          )}

          {/* Result Display */}
          {/* Result is shown via toast for a cleaner layout */}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>How it works:</strong></p>
            <p>1. Only the raffle creator can reveal the encryption key</p>
            <p>2. Raffle must be in &quot;Committed&quot; state (after tickets are claimed)</p>
            <p>3. Once revealed, all participants can decrypt their winning information</p>
            <p>4. Participants can then use the decrypted data to redeem their prizes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
