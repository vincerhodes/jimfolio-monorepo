'use client';

import { useTransition } from 'react';
import { deleteExpenseAction } from '@/app/actions';
import { Trash2 } from 'lucide-react';

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm('Delete this expense?')) {
          startTransition(() => deleteExpenseAction(id));
        }
      }}
      disabled={isPending}
      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Delete expense"
    >
      <Trash2 size={16} />
    </button>
  );
}
