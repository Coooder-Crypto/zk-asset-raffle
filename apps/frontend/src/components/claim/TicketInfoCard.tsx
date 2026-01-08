import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, Lock, Ticket as TicketIcon } from "lucide-react";
import { getRaffleStateText } from "@/utils/raffle";

export function TicketInfoCard({
  raffleId,
  sid,
  raffleState,
}: {
  raffleId?: string | null;
  sid: string;
  raffleState: number | null;
}) {
  return (
    <Card variant="glass" className="max-w-2xl mx-auto">
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-border/50">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TicketIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Ticket Information</h2>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-muted-foreground">Raffle ID</span>
              <Badge className="font-mono self-start sm:self-auto">
                {raffleId ? `${raffleId.slice(0, 8)}...` : 'Loading...'}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-muted-foreground">Ticket SID</span>
              <Badge className="font-mono self-start sm:self-auto">{`${sid.slice(0, 8)}...`}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-muted-foreground">Raffle State</span>
              <Badge className="inline-flex items-center gap-1 self-start sm:self-auto">
                {raffleState === 2 ? (
                  <Eye className="h-3 w-3" />
                ) : raffleState === 1 ? (
                  <Lock className="h-3 w-3" />
                ) : raffleState === 3 ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {getRaffleStateText(raffleState)}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
