"use client";

import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
export function useCrossChainAccount() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  return {
    chain: 'evm' as const,
    address,
    isConnected,
    openConnectModal,
  };
}
