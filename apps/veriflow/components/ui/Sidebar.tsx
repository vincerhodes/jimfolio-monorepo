'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  FileText, 
  BarChart3, 
  Users, 
  Calendar, 
  Settings,
  Home,
  PlusCircle
} from 'lucide-react';

interface SidebarProps {
  role: 'team' | 'management';
}

const teamNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Request Check', href: '/request-check', icon: PlusCircle },
  { name: 'My Checks', href: '/my-checks', icon: FileText },
];

const managementNavigation = [
  { name: 'Team Overview', href: '/team-overview', icon: Users },
  { name: 'Staff Planning', href: '/staff-planning', icon: Calendar },
  { name: 'Capacity Forecast', href: '/capacity-forecast', icon: BarChart3 },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isManagement = role === 'management';

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">VeriFlow</h1>
            <p className="text-sm text-gray-500">Solutions</p>
          </div>
        </div>
      </div>

      {/* Team Navigation */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        <div className="mb-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Team Activities
          </h3>
        </div>
        {teamNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}

        {/* Management Section - Always Visible */}
        {isManagement && (
          <>
            <div className="mt-8 mb-4">
              <h3 className="px-3 text-xs font-semibold text-purple-600 uppercase tracking-wider bg-purple-50 py-2 rounded">
                Management Activities
              </h3>
            </div>
            {managementNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-700'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-900'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-purple-500' : 'text-gray-400 group-hover:text-purple-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {role === 'management' ? 'MGR' : 'TEAM'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {role === 'management' ? 'Manager' : 'Team Member'}
            </p>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
