'use client';

import type { QRCodeClaimProps } from '@/components/claim/types';
import { ClaimTicketPanelEvm } from '@/components/claim/ClaimTicketPanelEvm';

export default function ClaimTicketPanel(props: QRCodeClaimProps) {
  return <ClaimTicketPanelEvm {...props} />;
}
