"use client";

import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { BLOCKCHAIN_TARGET } from '@/config/blockchain';

export function useCrossChainAccount() {
  if (BLOCKCHAIN_TARGET === 'sui') {
    const account = useCurrentAccount();

    return {
      chain: BLOCKCHAIN_TARGET as const,
      address: account?.address,
      isConnected: !!account,
      openConnectModal: undefined as (() => void) | undefined,
    };
  }

  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return {
    chain: BLOCKCHAIN_TARGET as const,
    address,
    isConnected,
    openConnectModal,
  };
}
