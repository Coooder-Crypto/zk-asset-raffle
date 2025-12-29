import { TransactionBlock } from '@mysten/sui.js/transactions';
import type { SuiClient } from '@mysten/sui.js/client';
import { SUI_CONTRACT } from '@/config/sui';

function getTarget(functionName: string): string {
  return `${SUI_CONTRACT.packageId}::${SUI_CONTRACT.moduleName}::${functionName}`;
}

export function buildCreateRaffleTx(activityId: string, totalTickets: bigint) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: getTarget(SUI_CONTRACT.createRaffleFunction),
    arguments: [tx.pure.string(activityId), tx.pure.u64(totalTickets)],
  });
  return tx;
}

export function buildCommitRaffleTx(activityId: string, merkleRoot: string) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: getTarget(SUI_CONTRACT.commitRaffleFunction),
    arguments: [tx.pure.string(activityId), tx.pure.string(merkleRoot)],
  });
  return tx;
}

export function buildClaimTicketTx(raffleId: string, sid: string, encryptedData: string) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: getTarget(SUI_CONTRACT.claimTicketFunction),
    arguments: [
      tx.pure.string(raffleId),
      tx.pure.string(sid),
      tx.pure.string(encryptedData),
    ],
  });
  return tx;
}

export function buildRedeemPrizeTx(
  raffleId: string,
  sid: string,
  revealValue: string,
  winLevel: number,
  proof: string[],
) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: getTarget(SUI_CONTRACT.redeemPrizeFunction),
    arguments: [
      tx.pure.string(raffleId),
      tx.pure.string(sid),
      tx.pure.string(revealValue),
      tx.pure.u64(BigInt(winLevel)),
      tx.pure(proof),
    ],
  });
  return tx;
}

export function buildRevealKeyTx(raffleId: string, key: string) {
  const tx = new TransactionBlock();
  tx.moveCall({
    target: getTarget(SUI_CONTRACT.revealKeyFunction),
    arguments: [tx.pure.string(raffleId), tx.pure.string(key)],
  });
  return tx;
}

export async function fetchSuiRaffle(client: SuiClient, raffleId: string) {
  return client.call<any>({
    target: getTarget(SUI_CONTRACT.getRaffleFunction),
    arguments: [raffleId],
  });
}

export async function fetchSuiTicketClaim(client: SuiClient, raffleId: string, sid: string) {
  return client.call<any>({
    target: getTarget(SUI_CONTRACT.getTicketClaimFunction),
    arguments: [raffleId, sid],
  });
}

export async function waitForSuiTransaction(client: SuiClient, digest: string) {
  return client.waitForTransactionBlock({ digest });
}
