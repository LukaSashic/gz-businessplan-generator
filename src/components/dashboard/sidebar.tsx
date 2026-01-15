'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '../../../lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardSidebarProps {
  user: User;
  profile: Profile | null;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Workshops',
    href: '/dashboard/workshops',
    icon: FileText,
  },
  {
    name: 'Einstellungen',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white lg:flex">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-gray-900">GZ Businessplan</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-gray-900'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium text-white">
            {profile?.full_name?.[0]?.toUpperCase() ||
              user.email?.[0]?.toUpperCase()}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {profile?.full_name || 'Benutzer'}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-4 w-full justify-start text-gray-600 hover:text-gray-900"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
