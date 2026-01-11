import { CONTRACT_ABI, CONTRACTS_BY_CHAIN, NETWORKS } from "@/config/contracts";
import type { ChainConfig } from "@/chains/types";

export const CHAIN_REGISTRY = {
  sepolia: {
    key: "sepolia",
    name: NETWORKS.sepolia.name,
    chainType: "evm",
    chainId: NETWORKS.sepolia.chainId,
    rpcUrl: NETWORKS.sepolia.rpcUrl,
    explorerUrl: NETWORKS.sepolia.blockExplorer,
    contracts: {
      raffle: CONTRACTS_BY_CHAIN.sepolia.raffle,
    },
  },
  mantleTestnet: {
    key: "mantleTestnet",
    name: NETWORKS.mantleTestnet.name,
    chainType: "evm",
    chainId: NETWORKS.mantleTestnet.chainId,
    rpcUrl: NETWORKS.mantleTestnet.rpcUrl,
    explorerUrl: NETWORKS.mantleTestnet.blockExplorer,
    contracts: {
      raffle: CONTRACTS_BY_CHAIN.mantleTestnet.raffle,
    },
  },
  arbitrumSepolia: {
    key: "arbitrumSepolia",
    name: NETWORKS.arbitrumSepolia.name,
    chainType: "evm",
    chainId: NETWORKS.arbitrumSepolia.chainId,
    rpcUrl: NETWORKS.arbitrumSepolia.rpcUrl,
    explorerUrl: NETWORKS.arbitrumSepolia.blockExplorer,
    contracts: {
      raffle: CONTRACTS_BY_CHAIN.arbitrumSepolia.raffle,
    },
  },
} as const satisfies Record<string, ChainConfig>;

export type ChainKey = keyof typeof CHAIN_REGISTRY;

export const DEFAULT_CHAIN_KEY: ChainKey = "sepolia";

export function getChainConfig(key: ChainKey): ChainConfig {
  return CHAIN_REGISTRY[key];
}

export { CONTRACT_ABI };
