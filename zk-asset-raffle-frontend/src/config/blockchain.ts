export type BlockchainTarget = 'evm' | 'sui';

export const BLOCKCHAIN_TARGET: BlockchainTarget =
  (process.env.NEXT_PUBLIC_BLOCKCHAIN_TARGET as BlockchainTarget) || 'evm';
