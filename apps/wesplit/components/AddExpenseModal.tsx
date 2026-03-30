'use client';

import { useEffect, useState, useTransition } from 'react';
import { addExpenseAction, editExpenseAction } from '@/app/actions';
import {
  DEFAULT_SPLIT_WITH,
  ExpenseFormInitial,
  PEOPLE,
  Person,
  capitalize,
  toDateInputValue,
} from '@/lib/types';
import { Plus, X } from 'lucide-react';
import { WESPLIT_EDIT_EXPENSE_EVENT } from './EditButton';

function buildDefaultExpense(currentUser: string): ExpenseFormInitial {
  return {
    description: '',
    amount: 0,
    paidBy: currentUser as ExpenseFormInitial['paidBy'],
    splitWith: DEFAULT_SPLIT_WITH,
    date: toDateInputValue(new Date()),
  };
}

export default function AddExpenseModal({ currentUser }: { currentUser: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExpenseFormInitial>(() => buildDefaultExpense(currentUser));
  const [splitWith, setSplitWith] = useState<Person[]>(DEFAULT_SPLIT_WITH);

  const isEditing = Boolean(draft.id);

  useEffect(() => {
    function handleEditExpense(event: Event) {
      const expense = (event as CustomEvent<ExpenseFormInitial>).detail;
      setDraft(expense);
      setSplitWith(expense.splitWith);
      setError(null);
      setOpen(true);
    }

    window.addEventListener(WESPLIT_EDIT_EXPENSE_EVENT, handleEditExpense as EventListener);
    return () => window.removeEventListener(WESPLIT_EDIT_EXPENSE_EVENT, handleEditExpense as EventListener);
  }, []);

  function handleClose() {
    setOpen(false);
    setError(null);
    setDraft(buildDefaultExpense(currentUser));
    setSplitWith(DEFAULT_SPLIT_WITH);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const action = draft.id ? editExpenseAction : addExpenseAction;

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setDraft(buildDefaultExpense(currentUser));
          setSplitWith(DEFAULT_SPLIT_WITH);
          setError(null);
          setOpen(true);
        }}
        className="fixed bottom-20 right-4 bg-teal-600 text-white rounded-full p-4 shadow-lg hover:bg-teal-700 active:bg-teal-800 transition-colors z-40"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {isEditing ? 'Edit Expense' : 'Add Expense'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="id" value={draft.id ?? ''} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <input
                  type="text"
                  name="description"
                  required
                  value={draft.description}
                  onChange={e => setDraft(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Dinner at hutong"
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (¥)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                      ¥
                    </span>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0.01"
                      step="0.01"
                      value={draft.amount || ''}
                      onChange={e =>
                        setDraft(prev => ({ ...prev, amount: Number.parseFloat(e.target.value) || 0 }))
                      }
                      placeholder="0.00"
                      className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={draft.date}
                    onChange={e => setDraft(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Paid by</label>
                <select
                  name="paidBy"
                  value={draft.paidBy}
                  onChange={e =>
                    setDraft(prev => ({ ...prev, paidBy: e.target.value as ExpenseFormInitial['paidBy'] }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  {PEOPLE.map(p => (
                    <option key={p} value={p}>
                      {capitalize(p)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Split with</label>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setSplitWith(PEOPLE)}
                      className="text-teal-600 hover:text-teal-700"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setSplitWith([])}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Unselect all
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {PEOPLE.map(p => {
                    const checked = splitWith.includes(p);

                    return (
                      <label
                        key={p}
                        className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 cursor-pointer border border-transparent hover:border-teal-200 hover:bg-teal-50 has-[:checked]:bg-teal-50 has-[:checked]:border-teal-200 transition-colors"
                      >
                        <input
                          type="checkbox"
                          name="splitWith"
                          value={p}
                          checked={checked}
                          onChange={e => {
                            setSplitWith(prev =>
                              e.target.checked ? [...prev, p] : prev.filter(person => person !== p),
                            );
                          }}
                          className="accent-teal-600"
                        />
                        <span className="text-sm font-medium text-slate-700">{capitalize(p)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? (isEditing ? 'Saving...' : 'Adding...') : isEditing ? 'Save Changes' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
