import { ExpenseWithParsed, capitalize, toDateInputValue } from '@/lib/types';
import EditButton from './EditButton';
import DeleteButton from './DeleteButton';

export default function ExpenseCard({ expense }: { expense: ExpenseWithParsed }) {
  const date = new Date(expense.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
  const perPerson = expense.amount / expense.splitWith.length;
  const editableExpense = {
    ...expense,
    date: toDateInputValue(expense.date),
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 truncate">{expense.description}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
              {capitalize(expense.paidBy)} paid
            </span>
            <span className="text-xs text-slate-400">
              ÷ {expense.splitWith.map(capitalize).join(', ')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {date} · ¥{perPerson.toFixed(2)} each
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="font-semibold text-teal-600 text-lg">¥{expense.amount.toFixed(2)}</p>
          <div className="flex items-center gap-1">
            <EditButton expense={editableExpense} />
            <DeleteButton id={expense.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
