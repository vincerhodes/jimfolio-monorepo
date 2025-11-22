import Link from 'next/link';
import { Home, PlusCircle, FileText, BarChart3, Inbox, Settings, Mail, ArrowRight, MessageSquare } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col h-full">
      <div className="p-4 bg-indigo-700 text-white font-bold text-xl flex items-center gap-2">
        <div className="bg-white text-indigo-700 p-1 rounded">SR</div>
        SweetReach
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/walkthrough" className="flex items-center gap-3 px-3 py-2 text-indigo-700 bg-indigo-50 border border-indigo-100 shadow-sm rounded transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 font-bold">
              <ArrowRight size={20} />
              Start Here: Walkthrough
            </Link>
          </li>
          <li>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <Home size={20} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/insights" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <Inbox size={20} />
              All Insights
            </Link>
          </li>
          <li>
            <Link href="/insights/new" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <PlusCircle size={20} />
              Submit Insight
            </Link>
          </li>
          <li>
            <Link href="/report" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <FileText size={20} />
              Action Report
            </Link>
          </li>
          <li>
            <Link href="/tasking" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <BarChart3 size={20} />
              Taskings
            </Link>
          </li>
          <li>
            <Link href="/digest" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <Settings size={20} />
              My Subscriptions
            </Link>
          </li>
          <li>
            <Link href="/email-preview" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-white hover:shadow-md hover:-translate-y-0.5 hover:text-indigo-600 rounded transition-all duration-200 font-medium">
              <Mail size={20} />
              Email Preview
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-300">
        <Link href="/app-feedback" className="flex items-center gap-2 text-xs text-indigo-600 font-bold mb-4 hover:underline">
          <MessageSquare size={14} />
          Feedback on App
        </Link>
        <Link href="/admin/feedback" className="flex items-center gap-2 text-xs text-gray-500 font-bold mb-4 hover:underline">
          <Settings size={14} />
          Admin: View Feedback
        </Link>
        <a href="https://jimfolio.space" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-4 hover:text-indigo-500 transition-colors">
          <ArrowRight size={14} />
          Back to Jimfolio Space
        </a>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full text-white flex items-center justify-center font-bold">SJ</div>
          <div className="text-sm">
            <p className="font-bold text-gray-800">Sarah Jenkins</p>
            <p className="text-gray-500">Manager (UK)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
