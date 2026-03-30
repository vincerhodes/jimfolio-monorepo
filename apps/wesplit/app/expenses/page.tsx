import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { parseExpense } from '@/lib/types';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AddExpenseModal from '@/components/AddExpenseModal';
import ExpenseCard from '@/components/ExpenseCard';

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/wesplit/login');

  const rawExpenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' },
  });

  const expenses = rawExpenses.map(parseExpense);
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header user={user} />

      <main className="max-w-lg mx-auto px-4 pt-4">
        {expenses.length > 0 && (
          <div className="bg-teal-600 text-white rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Total group spend</p>
              <p className="text-2xl font-bold">¥{totalSpend.toFixed(2)}</p>
            </div>
            <p className="text-teal-100 text-sm">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-lg font-medium">No expenses yet</p>
            <p className="text-sm mt-1">Tap + to add the first one</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map(expense => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        )}
      </main>

      <AddExpenseModal currentUser={user} />
      <BottomNav active="expenses" />
    </div>
  );
}
