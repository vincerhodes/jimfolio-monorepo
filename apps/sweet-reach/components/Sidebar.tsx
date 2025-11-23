'use client';

import Link from 'next/link';
import { Home, PlusCircle, FileText, BarChart3, Inbox, Settings, Mail, ArrowRight, MessageSquare } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Sidebar() {
  return (
    <div className="w-64 flex flex-col h-full border-r transition-colors" style={{ 
      background: 'var(--bg-secondary)', 
      borderColor: 'var(--border-color)' 
    }}>
      <div className="p-4 font-bold text-xl flex items-center gap-2" style={{ 
        background: 'var(--accent-primary)', 
        color: 'var(--bg-primary)' 
      }}>
        <div className="p-1 rounded" style={{ 
          background: 'var(--bg-primary)', 
          color: 'var(--accent-primary)' 
        }}>SR</div>
        SweetReach
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/walkthrough" className="flex items-center gap-3 px-3 py-2 border shadow-sm rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-bold" style={{
              color: 'var(--accent-primary)',
              background: 'var(--bg-primary)',
              borderColor: 'var(--accent-primary)'
            }}>
              <ArrowRight size={20} />
              Start Here: Walkthrough
            </Link>
          </li>
          <li>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <Home size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/insights" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <Inbox size={20} />
              All Insights
            </Link>
          </li>
          <li>
            <Link href="/insights/new" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <PlusCircle size={20} />
              Submit Insight
            </Link>
          </li>
          <li>
            <Link href="/report" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <FileText size={20} />
              Action Report
            </Link>
          </li>
          <li>
            <Link href="/tasking" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <BarChart3 size={20} />
              Taskings
            </Link>
          </li>
          <li>
            <Link href="/digest" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <Settings size={20} />
              My Subscriptions
            </Link>
          </li>
          <li>
            <Link href="/email-preview" className="flex items-center gap-3 px-3 py-2 rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-medium" style={{
              color: 'var(--text-primary)'
            }}>
              <Mail size={20} />
              Email Preview
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t transition-colors" style={{ borderColor: 'var(--border-color)' }}>
        {/* Theme Toggle */}
        <div className="mb-4">
          <p className="text-xs font-bold mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>Theme</p>
          <ThemeToggle />
        </div>

        <Link href="/app-feedback" className="flex items-center gap-2 text-xs font-bold mb-4 hover:underline transition-colors" style={{ color: 'var(--accent-primary)' }}>
          <MessageSquare size={14} />
          Feedback on App
        </Link>
        <Link href="/admin/feedback" className="flex items-center gap-2 text-xs font-bold mb-4 hover:underline transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <Settings size={14} />
          Admin: View Feedback
        </Link>
        <a href="https://jimfolio.space" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium mb-4 hover:underline transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowRight size={14} />
          Back to Jimfolio Space
        </a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors" style={{ 
            background: 'var(--accent-primary)', 
            color: 'var(--bg-primary)' 
          }}>SJ</div>
          <div className="text-sm">
            <p className="font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>Sarah Jenkins</p>
            <p className="transition-colors" style={{ color: 'var(--text-secondary)' }}>Manager (UK)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
