'use client';

import { BLOCKCHAIN_TARGET } from '@/config/blockchain';
import { CreateRaffleFormEvm } from '@/components/create/CreateRaffleFormEvm';
import { CreateRaffleFormSui } from '@/components/create/CreateRaffleFormSui';

export default function CreateRaffleForm() {
  if (BLOCKCHAIN_TARGET === 'sui') {
    return <CreateRaffleFormSui />;
  }
  return <CreateRaffleFormEvm />;
}
