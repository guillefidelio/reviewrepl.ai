'use client';

import { User } from 'firebase/auth';
import { UserProfile } from '@/lib/types';
import { Menu, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  user: User;
  userProfile?: UserProfile | null;
  onSignOut: () => void;
  onMenuClick: () => void;
}

export function Header({ user, userProfile, onSignOut, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const displayName = userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Get the current page name from the pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/dashboard/prompts') return 'Answering Mode';
    if (pathname === '/dashboard/profile') return 'Profile';
    if (pathname === '/dashboard/legacy') return 'Legacy';
    
    // Extract page name from pathname for any other routes
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
  };

  const pageTitle = getPageTitle();

  return (
    <header className="bg-card shadow-sm border-b border-border sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop title - now dynamic based on current page */}
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-card-foreground">{pageTitle}</h1>
        </div>

        {/* User info and actions */}
        <div className="flex items-center space-x-4">
          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">free</span>
              <span className="text-xs text-muted-foreground">|</span>
              <span className="text-xs text-muted-foreground">active</span>
            </div>
          </div>

          {/* User avatar */}
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {userInitial}
              </span>
            </div>
            
            {/* Sign out button */}
            <button
              onClick={onSignOut}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

