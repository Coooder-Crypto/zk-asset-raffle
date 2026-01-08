'use client';

import type { RevealKeyComponentProps } from '@/components/admin/types';
import { RevealKeyDialogEvm } from '@/components/admin/RevealKeyDialogEvm';

export default function RevealKeyDialog(props: RevealKeyComponentProps) {
  return <RevealKeyDialogEvm {...props} />;
}
