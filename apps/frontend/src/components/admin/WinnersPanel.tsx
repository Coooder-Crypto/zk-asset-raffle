import AutoRedeemList from '@/components/AutoRedeemList';

export function WinnersPanel({
  raffleId,
  winnersMap,
  setWinnersMap,
  publicClient,
  writeContractAsync,
  toast,
}: {
  raffleId: string;
  winnersMap: Record<string, Array<{ sid: string; r_i: string; win_i: number; proof: string[]; isRedeemed?: boolean; redeeming?: boolean; txHash?: string; error?: string }>>;
  setWinnersMap: React.Dispatch<React.SetStateAction<Record<string, Array<{ sid: string; r_i: string; win_i: number; proof: string[]; isRedeemed?: boolean; redeeming?: boolean; txHash?: string; error?: string }>>>>;
  publicClient: unknown;
  writeContractAsync: unknown;
  toast: unknown;
}) {
  return (
    <AutoRedeemList
      raffleId={raffleId}
      winnersMap={winnersMap}
      setWinnersMap={setWinnersMap}
      publicClient={publicClient}
      writeContractAsync={writeContractAsync}
      toast={toast}
    />
  );
}
