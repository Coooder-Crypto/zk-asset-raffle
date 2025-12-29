'use client';

import { BLOCKCHAIN_TARGET } from '@/config/blockchain';
import type { RevealKeyComponentProps } from '@/components/reveal/types';
import { RevealKeyDialogEvm } from '@/components/RevealKeyDialogEvm';
import { RevealKeyDialogSui } from '@/components/RevealKeyDialogSui';

export default function RevealKeyDialog(props: RevealKeyComponentProps) {
  if (BLOCKCHAIN_TARGET === 'sui') {
    return <RevealKeyDialogSui {...props} />;
  }
  return <RevealKeyDialogEvm {...props} />;
}
