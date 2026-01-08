import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gift } from "lucide-react";

export function StatusGrid({
  isChecking,
  status,
  raffleState,
}: {
  isChecking: boolean;
  status: { isClaimed: boolean; isRedeemed: boolean; canRedeem: boolean } | null;
  raffleState: number | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="text-center space-y-2">
        <div className="text-muted-foreground text-sm">Claimed</div>
        <Badge className="inline-flex items-center gap-1 px-3 py-1">
          {status?.isClaimed && <CheckCircle className="h-4 w-4" />}
          {isChecking ? 'Checking...' : status ? (status.isClaimed ? 'Yes' : 'No') : '-'}
        </Badge>
      </div>
      <div className="text-center space-y-2">
        <div className="text-muted-foreground text-sm">Redeemed</div>
        <Badge className="inline-flex items-center gap-1 px-3 py-1">
          {status?.isRedeemed && <Gift className="h-4 w-4" />}
          {isChecking ? 'Checking...' : status ? (status.isRedeemed ? 'Yes' : 'No') : '-'}
        </Badge>
      </div>
      <div className="text-center space-y-2">
        <div className="text-muted-foreground text-sm">Can Redeem</div>
        <Badge className="inline-flex items-center gap-1 px-3 py-1">
          {raffleState === 2 ? 'Yes' : 'No'}
        </Badge>
      </div>
    </div>
  );
}
