import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { parseExpense, capitalize } from '@/lib/types';
import { calculateSettlement } from '@/lib/settlement';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default async function SettlePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const rawExpenses = await prisma.expense.findMany();
  const expenses = rawExpenses.map(parseExpense);
  const { transfers, summary } = calculateSettlement(expenses);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header user={user} />

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* My balance */}
        <div
          className={`rounded-2xl p-4 ${
            summary[user].net >= 0 ? 'bg-teal-600' : 'bg-amber-500'
          } text-white`}
        >
          <p className="text-sm opacity-80">Your balance</p>
          <p className="text-2xl font-bold mt-0.5">
            {summary[user].net >= 0
              ? `${capitalize(user)} is owed ¥${summary[user].net.toFixed(2)}`
              : `${capitalize(user)} owes ¥${Math.abs(summary[user].net).toFixed(2)}`}
          </p>
          <p className="text-sm mt-1 opacity-70">
            Paid ¥{summary[user].paid.toFixed(2)} · Share ¥{summary[user].owed.toFixed(2)}
          </p>
        </div>

        {/* Payments needed */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Payments needed
          </h2>
          {transfers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center text-slate-400">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-medium">All settled up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transfers.map((t, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
                    t.from === user || t.to === user
                      ? 'border-teal-200 bg-teal-50/60'
                      : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${t.from === user ? 'text-amber-600' : 'text-slate-900'}`}>
                      {capitalize(t.from)}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className={`font-semibold ${t.to === user ? 'text-teal-600' : 'text-slate-900'}`}>
                      {capitalize(t.to)}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">¥{t.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary table */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Summary
          </h2>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Person</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Paid</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Share</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Net</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(summary).map(([person, s]) => (
                  <tr
                    key={person}
                    className={`border-b last:border-0 border-slate-50 ${
                      person === user ? 'bg-teal-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">{capitalize(person)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">¥{s.paid.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">¥{s.owed.toFixed(2)}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        s.net >= 0 ? 'text-teal-600' : 'text-amber-600'
                      }`}
                    >
                      {s.net >= 0 ? '+' : ''}¥{s.net.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <BottomNav active="settle" />
    </div>
  );
}
