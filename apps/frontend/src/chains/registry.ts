import { CONTRACTS, NETWORK_CONFIG } from "@/config/contracts";
import type { ChainConfig } from "@/chains/types";

export const CHAIN_REGISTRY = {
  sepolia: {
    key: "sepolia",
    name: NETWORK_CONFIG.name,
    chainType: "evm",
    chainId: NETWORK_CONFIG.chainId,
    rpcUrl: NETWORK_CONFIG.rpcUrl,
    explorerUrl: NETWORK_CONFIG.blockExplorer,
    contracts: {
      raffle: CONTRACTS.ZK_ASSET_RAFFLE.address,
    },
  },
} as const satisfies Record<string, ChainConfig>;

export type ChainKey = keyof typeof CHAIN_REGISTRY;

export const DEFAULT_CHAIN_KEY: ChainKey = "sepolia";

export function getChainConfig(key: ChainKey): ChainConfig {
  return CHAIN_REGISTRY[key];
}
