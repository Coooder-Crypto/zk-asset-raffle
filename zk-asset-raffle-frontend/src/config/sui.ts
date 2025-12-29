import { getFullnodeUrl } from '@mysten/sui.js/client';

const defaultRpcUrl = process.env.NEXT_PUBLIC_SUI_RPC_URL || getFullnodeUrl('testnet');

export const SUI_CONTRACT = {
  packageId: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x9c10e6dffb7a4c3e9cb3e7c8a4b67a1d3926c1aaaddc9f76f5c4b5ab3cd91234',
  moduleName: process.env.NEXT_PUBLIC_SUI_MODULE_NAME || 'zk_asset_raffle',
  createRaffleFunction: process.env.NEXT_PUBLIC_SUI_CREATE_FN || 'create_raffle',
  commitRaffleFunction: process.env.NEXT_PUBLIC_SUI_COMMIT_FN || 'commit_raffle',
  claimTicketFunction: process.env.NEXT_PUBLIC_SUI_CLAIM_FN || 'claim_ticket',
  redeemPrizeFunction: process.env.NEXT_PUBLIC_SUI_REDEEM_FN || 'redeem_prize',
  revealKeyFunction: process.env.NEXT_PUBLIC_SUI_REVEAL_FN || 'reveal_key',
  getRaffleFunction: process.env.NEXT_PUBLIC_SUI_GET_RAFFLE_FN || 'get_raffle',
  getTicketClaimFunction: process.env.NEXT_PUBLIC_SUI_GET_TICKET_FN || 'get_ticket_claim',
};

export const SUI_NETWORK = {
  rpcUrl: defaultRpcUrl,
  network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'custom',
};
