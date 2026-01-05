'use client';

import type { RevealKeyComponentProps } from '@/components/reveal/types';
import { RevealKeyDialogEvm } from '@/components/RevealKeyDialogEvm';

export default function RevealKeyDialog(props: RevealKeyComponentProps) {
  return <RevealKeyDialogEvm {...props} />;
}
