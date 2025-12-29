"use client";

import { ReactNode, useMemo } from 'react';
import '@mysten/dapp-kit/dist/styles.css';
import {
  SuiClientProvider,
  WalletProvider,
  createNetworkConfig,
} from '@mysten/dapp-kit';
import { SUI_NETWORK } from '@/config/sui';

export function SuiProviders({ children }: { children: ReactNode }) {
  const { networkConfig, networkName } = useMemo(() => {
    const name = SUI_NETWORK.network || 'custom';
    const { networkConfig, networkName } = createNetworkConfig({
      [name]: { url: SUI_NETWORK.rpcUrl },
    });
    return { networkConfig, networkName: networkName ?? name };
  }, []);

  return (
    <SuiClientProvider networks={networkConfig} defaultNetwork={networkName}>
      <WalletProvider autoConnect>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}
