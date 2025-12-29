'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/utils/api-service';
import type { RevealKeyComponentProps } from '@/components/reveal/types';
import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { buildRevealKeyTx, waitForSuiTransaction } from '@/lib/sui/raffle';
import { useSuiRaffleState } from '@/hooks/useSuiRaffleState';

export function RevealKeyDialogSui({ raffleId, onRevealSuccess }: RevealKeyComponentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [revealResult, setRevealResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
  } | null>(null);

  const { toast } = useToast();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransactionBlock();
  const { data: raffleData, refetch } = useSuiRaffleState(raffleId);

  const handleRevealKey = async () => {
    if (!account) {
      toast({
        title: 'Error',
        description: 'Connect your Sui wallet before revealing the key',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setRevealResult(null);

    try {
      const resp = await apiService.revealActivity(raffleId);
      if (resp.status !== 'success' || !resp.key) {
        throw new Error(resp.message || 'Failed to obtain encryption key from backend');
      }

      const tx = buildRevealKeyTx(raffleId, resp.key);
      const result = await signAndExecute({ transactionBlock: tx, options: { showEffects: true } });

      if (!result.digest) {
        throw new Error('Transaction digest missing for Sui reveal');
      }

      await waitForSuiTransaction(suiClient, result.digest);
      await refetch();

      const outcome = {
        success: true,
        message: 'Encryption key revealed on Sui. Participants can redeem.',
        txHash: result.digest,
      };

      setRevealResult(outcome);
      if (onRevealSuccess) {
        onRevealSuccess(outcome);
      }

      toast({
        title: 'Reveal success',
        description: `Digest: ${result.digest.slice(0, 12)}...`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Reveal key error on Sui:', error);
      const message = error instanceof Error ? error.message : 'Failed to reveal key on Sui';

      setRevealResult({
        success: false,
        message,
      });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isRaffleCreator = raffleData && account && raffleData.creator?.toLowerCase() === account.address?.toLowerCase();
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
              As the raffle creator, reveal the encryption key so participants can redeem on Sui
            </p>
          </div>

          {!account && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Please connect your Sui wallet to reveal the encryption key
              </AlertDescription>
            </Alert>
          )}

          {account && !isRaffleCreator && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Only the raffle creator can reveal the encryption key
              </AlertDescription>
            </Alert>
          )}

          {account && isRaffleCreator && currentState !== 1 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Raffle must be in "Committed" state to reveal the key. Current state: {
                  currentState === 0 ? 'Created (commit first)' :
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
                Encryption key has already been revealed on Sui
              </AlertDescription>
            </Alert>
          )}

          {account && isRaffleCreator && currentState === 1 && !keyAlreadyRevealed && (
            <Button
              onClick={handleRevealKey}
              disabled={isProcessing || !!revealResult?.success}
              className="w-full"
              variant="gradient"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Revealing...
                </>
              ) : (
                <>
                  <Key className="mr-2 h-4 w-4" /> Reveal Encryption Key
                </>
              )}
            </Button>
          )}

          {revealResult && (
            <div className={`rounded-lg border p-4 ${revealResult.success ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {revealResult.message}
              {revealResult.txHash && (
                <div className="mt-2 text-xs">
                  Digest: {revealResult.txHash}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
