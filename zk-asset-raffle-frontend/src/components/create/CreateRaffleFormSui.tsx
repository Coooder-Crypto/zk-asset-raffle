'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PrizeTierList, PrizeTier } from '@/components/create/PrizeTierList';
import { TicketConfig } from '@/components/create/TicketConfig';
import { ProgressPanel } from '@/components/create/ProgressPanel';
import { SectionHeader } from '@/components/common/SectionHeader';
import { apiService } from '@/utils/api-service';
import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { buildCommitRaffleTx, buildCreateRaffleTx, waitForSuiTransaction } from '@/lib/sui/raffle';

export function CreateRaffleFormSui() {
  const [raffleName, setRaffleName] = useState('');
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([
    { name: 'First Prize', quantity: '1', winningPercentage: '10' },
  ]);
  const [ticketCount, setTicketCount] = useState('100');
  const [totalPercentage, setTotalPercentage] = useState<number>(10);
  const [formErrors, setFormErrors] = useState<{
    raffleName?: string;
    prizeTiers?: string;
    ticketCount?: string;
    totalPercentage?: string;
    general?: string;
  }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState({ step: '', percentage: 0 });

  const router = useRouter();
  const { toast } = useToast();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransactionBlock();

  const addPrizeTier = () => {
    if (prizeTiers.length >= 10) {
      toast({
        title: 'Maximum Limit Reached',
        description: 'You can create up to 10 prize tiers',
        variant: 'destructive',
      });
      return;
    }

    const newTier = {
      name: `Prize ${prizeTiers.length + 1}`,
      quantity: '1',
      winningPercentage: '5',
    };
    const next = [...prizeTiers, newTier];
    setPrizeTiers(next);
    calculateTotalPercentage(next);
  };

  const insertPrizeTierAfter = (index: number) => {
    if (prizeTiers.length >= 10) {
      toast({
        title: 'Maximum Limit Reached',
        description: 'You can create up to 10 prize tiers',
        variant: 'destructive',
      });
      return;
    }
    const newTier = {
      name: `Prize ${prizeTiers.length + 1}`,
      quantity: '1',
      winningPercentage: '5',
    };
    const next = [...prizeTiers];
    next.splice(index + 1, 0, newTier);
    setPrizeTiers(next);
    calculateTotalPercentage(next);
  };

  const removePrizeTier = (index: number) => {
    const next = prizeTiers.filter((_, i) => i !== index);
    setPrizeTiers(next);
    calculateTotalPercentage(next);
  };

  const updatePrizeTier = (index: number, field: keyof PrizeTier, value: string) => {
    const next = [...prizeTiers];
    next[index] = { ...next[index], [field]: value };
    setPrizeTiers(next);
    calculateTotalPercentage(next);
  };

  const calculateTotalPercentage = (tiers: PrizeTier[]) => {
    const total = tiers.reduce((sum, tier) => {
      const percentage = parseFloat(tier.winningPercentage) || 0;
      return sum + percentage;
    }, 0);
    setTotalPercentage(total);
  };

  const handleTicketCountChange = (value: string) => {
    setTicketCount(value);
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!raffleName.trim()) {
      errors.raffleName = 'Raffle name is required';
    } else if (raffleName.trim().length < 3) {
      errors.raffleName = 'Raffle name must be at least 3 characters';
    } else if (raffleName.trim().length > 100) {
      errors.raffleName = 'Raffle name must be less than 100 characters';
    }

    if (prizeTiers.length === 0) {
      errors.prizeTiers = 'At least one prize tier is required';
    } else {
      prizeTiers.forEach((tier, index) => {
        if (!tier.name.trim()) {
          errors.prizeTiers = `Tier ${index + 1}: Prize name is required`;
        }
        const quantity = parseInt(tier.quantity, 10);
        if (Number.isNaN(quantity) || quantity <= 0) {
          errors.prizeTiers = `Tier ${index + 1}: Quantity must be greater than zero`;
        }
        const winPercentage = parseFloat(tier.winningPercentage);
        if (Number.isNaN(winPercentage) || winPercentage <= 0 || winPercentage > 100) {
          errors.prizeTiers = `Tier ${index + 1}: Win rate must be between 0 and 100`;
        }
      });
    }

    const tickets = parseInt(ticketCount, 10);
    if (Number.isNaN(tickets) || tickets <= 0) {
      errors.ticketCount = 'Ticket count must be greater than zero';
    }

    if (totalPercentage > 100) {
      errors.totalPercentage = 'Total prize winning percentage cannot exceed 100%';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting the form',
        variant: 'destructive',
      });
      return;
    }

    if (!account) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Connect your Sui wallet before creating a raffle',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      setCreationProgress({ step: 'Creating raffle on backend...', percentage: 25 });

      const prizes = prizeTiers.map((tier) => ({
        name: tier.name,
        count: parseInt(tier.quantity, 10),
        winning_percentage: parseFloat(tier.winningPercentage),
      }));

      const activityData = {
        name: raffleName.trim(),
        total_items: parseInt(ticketCount, 10),
        prizes,
        creator_address: account.address,
      };

      const response = await apiService.createActivity(activityData);

      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to create activity');
      }

      const activityId = response.activity_id!;
      const merkleRoot = response.merkle_root!;

      setCreationProgress({ step: 'Creating raffle on blockchain...', percentage: 50 });

      const createTx = buildCreateRaffleTx(activityId, BigInt(parseInt(ticketCount, 10)));
      const createResult = await signAndExecute({
        transactionBlock: createTx,
        options: { showEffects: true },
      });

      if (!createResult.digest) {
        throw new Error('Transaction digest missing for create raffle');
      }

      await waitForSuiTransaction(suiClient, createResult.digest);

      setCreationProgress({ step: 'Committing merkle root to blockchain...', percentage: 75 });

      const commitTx = buildCommitRaffleTx(activityId, merkleRoot);
      const commitResult = await signAndExecute({
        transactionBlock: commitTx,
        options: { showEffects: true },
      });

      if (!commitResult.digest) {
        throw new Error('Transaction digest missing for commit raffle');
      }

      await waitForSuiTransaction(suiClient, commitResult.digest);

      setCreationProgress({ step: 'Raffle created successfully!', percentage: 100 });

      toast({
        title: 'Success',
        description: 'Raffle created and committed successfully! Redirecting to admin panel...',
      });

      setTimeout(() => {
        router.push('/admin');
      }, 2000);
    } catch (error) {
      console.error('Error creating Sui raffle:', error);
      const description =
        error instanceof Error ? error.message : 'Failed to create raffle on Sui network';
      toast({ title: 'Error', description, variant: 'destructive' });
      setCreationProgress({ step: '', percentage: 0 });
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-8">
      <div className="space-y-6">
        <SectionHeader icon={<Gift className="h-5 w-5" />} title="Raffle Name" colorClass="primary" />
        <Input
          placeholder="e.g., Summer Lucky Draw 2024"
          value={raffleName}
          onChange={(e) => setRaffleName(e.target.value)}
          required
        />
        {formErrors.raffleName && <p className="text-xs text-destructive">{formErrors.raffleName}</p>}
      </div>

      <PrizeTierList
        prizeTiers={prizeTiers}
        error={formErrors.prizeTiers}
        onAdd={addPrizeTier}
        onInsertAfter={insertPrizeTierAfter}
        onRemove={removePrizeTier}
        onUpdate={updatePrizeTier}
      />

      {formErrors.totalPercentage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{formErrors.totalPercentage}</p>
        </div>
      )}

      <TicketConfig ticketCount={ticketCount} onChange={handleTicketCountChange} error={formErrors.ticketCount} />

      {isCreating && <ProgressPanel step={creationProgress.step} percentage={creationProgress.percentage} />}

      <div className="pt-4">
        <Button type="submit" variant="gradient" className="w-full h-11" disabled={isCreating}>
          {isCreating ? 'Creating Raffle...' : 'Create & Deploy Raffle'}
        </Button>
      </div>
    </form>
  );
}
