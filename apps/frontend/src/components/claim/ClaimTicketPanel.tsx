'use client';

import type { QRCodeClaimProps } from '@/types/ui';
import { ClaimTicketPanelEvm } from '@/components/claim/ClaimTicketPanelEvm';

export default function ClaimTicketPanel(props: QRCodeClaimProps) {
  return <ClaimTicketPanelEvm {...props} />;
}
