export interface RevealKeyComponentProps {
  raffleId: string;
  onRevealSuccess?: (result: { success: boolean; message: string; txHash?: string }) => void;
}
