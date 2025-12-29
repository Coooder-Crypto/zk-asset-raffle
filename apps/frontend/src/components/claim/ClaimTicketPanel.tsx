'use client';

import { BLOCKCHAIN_TARGET } from '@/config/blockchain';
import type { QRCodeClaimProps } from '@/components/claim/types';
import { ClaimTicketPanelEvm } from '@/components/claim/ClaimTicketPanelEvm';
import { ClaimTicketPanelSui } from '@/components/claim/ClaimTicketPanelSui';

export default function ClaimTicketPanel(props: QRCodeClaimProps) {
  if (BLOCKCHAIN_TARGET === 'sui') {
    return <ClaimTicketPanelSui {...props} />;
  }
  return <ClaimTicketPanelEvm {...props} />;
}
