'use client';

import { useState, useTransition, useRef } from 'react';
import { addExpenseAction } from '@/app/actions';
import { PEOPLE, capitalize } from '@/lib/types';
import { Plus, X } from 'lucide-react';

export default function AddExpenseModal({ currentUser }: { currentUser: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleClose() {
    setOpen(false);
    setError(null);
    formRef.current?.reset();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addExpenseAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        handleClose();
      }
    });
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 bg-teal-600 text-white rounded-full p-4 shadow-lg hover:bg-teal-700 active:bg-teal-800 transition-colors z-40"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center sm:justify-center"
          onClick={e => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 pb-8 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-900">Add Expense</h2>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  required
                  placeholder="e.g. Dinner at hutong"
                  className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Amount (¥)
                </label>
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
                    placeholder="0.00"
                    className="w-full border border-slate-200 rounded-xl pl-8 pr-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Paid by
                </label>
                <select
                  name="paidBy"
                  defaultValue={currentUser}
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
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Split with
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PEOPLE.map(p => (
                    <label
                      key={p}
                      className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 cursor-pointer border border-transparent hover:border-teal-200 hover:bg-teal-50 has-[:checked]:bg-teal-50 has-[:checked]:border-teal-200 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="splitWith"
                        value={p}
                        defaultChecked
                        className="accent-teal-600"
                      />
                      <span className="text-sm font-medium text-slate-700">{capitalize(p)}</span>
                    </label>
                  ))}
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
                {isPending ? 'Adding...' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
