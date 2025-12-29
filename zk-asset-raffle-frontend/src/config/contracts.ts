// 合约配置文件
import ZkAssetRaffleABI from '@/abi/ZkAssetRaffle.json';

export const CONTRACTS = {
  ZK_ASSET_RAFFLE: {
    // Get address from environment variables
    address: (process.env.NEXT_PUBLIC_ZK_ASSET_RAFFLE_CONTRACT_ADDRESS || 
             "0x1234567890123456789012345678901234567890") as `0x${string}`,
    abi: ZkAssetRaffleABI
  }
};

// 网络配置
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia chain ID
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
  blockExplorer: "https://sepolia.etherscan.io"
};