'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface DashboardHeaderProps {
  user: User;
  profile: Profile | null;
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb or Title */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* User avatar - mobile */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white lg:hidden">
          {profile?.full_name?.[0]?.toUpperCase() ||
            user.email?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
