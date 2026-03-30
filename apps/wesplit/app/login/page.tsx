'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import { PEOPLE, capitalize } from '@/lib/types';

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✂️</div>
          <h1 className="text-3xl font-bold text-teal-600">WeSplit</h1>
          <p className="text-slate-500 mt-1 text-sm">China holiday expenses</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Who are you?
            </label>
            <select
              name="username"
              required
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select your name...</option>
              {PEOPLE.map(p => (
                <option key={p} value={p}>{capitalize(p)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-teal-600 text-white rounded-xl py-3 font-semibold hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
