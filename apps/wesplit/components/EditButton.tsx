'use client';

import { ExpenseFormInitial } from '@/lib/types';
import { PencilLine } from 'lucide-react';

export const WESPLIT_EDIT_EXPENSE_EVENT = 'wesplit:edit-expense';

export default function EditButton({ expense }: { expense: ExpenseFormInitial }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent<ExpenseFormInitial>(WESPLIT_EDIT_EXPENSE_EVENT, { detail: expense }),
        );
      }}
      className="p-1.5 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
      title="Edit expense"
    >
      <PencilLine size={16} />
    </button>
  );
}
