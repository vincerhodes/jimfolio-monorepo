import Link from 'next/link';
import { Receipt, ArrowLeftRight } from 'lucide-react';

interface BottomNavProps {
  active: 'expenses' | 'settle';
}

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 flex z-30">
      <Link
        href="./expenses"
        className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
          active === 'expenses' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Receipt size={20} />
        <span>Expenses</span>
      </Link>
      <Link
        href="./settle"
        className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
          active === 'settle' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <ArrowLeftRight size={20} />
        <span>Settle Up</span>
      </Link>
    </nav>
  );
}
