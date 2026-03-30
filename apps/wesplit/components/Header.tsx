import { logoutAction } from '@/app/actions';
import { capitalize } from '@/lib/types';
import { LogOut } from 'lucide-react';

export default function Header({ user }: { user: string }) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-teal-600">WeSplit</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{capitalize(user)}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
