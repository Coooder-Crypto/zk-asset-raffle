'use client';

import type { RevealKeyComponentProps } from '@/types/ui';
import { RevealKeyDialogEvm } from '@/components/admin/RevealKeyDialogEvm';

export default function RevealKeyDialog(props: RevealKeyComponentProps) {
  return <RevealKeyDialogEvm {...props} />;
}
