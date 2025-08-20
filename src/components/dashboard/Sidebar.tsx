'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  User as UserIcon, 
  MessageSquare, 
  Globe,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'Manage your info'
    },
    {
      name: 'Answering Mode',
      href: '/dashboard/prompts',
      icon: MessageSquare,
      description: 'Choose response method'
    }
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-card-foreground">ReviewRepl.ai</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose()}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Chrome Extension Info */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground mb-2">Chrome Extension</div>
            <div className="text-sm font-medium text-card-foreground">Version 2.0.1</div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:col-start-1 lg:row-start-1">
        <div className="h-full flex flex-col bg-card shadow-lg">
          {/* Desktop header */}
          <div className="flex h-16 items-center px-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-card-foreground">ReviewRepl.ai</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Chrome Extension Info */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground mb-2">Chrome Extension</div>
            <div className="text-sm font-medium text-card-foreground">Version 2.0.1</div>
          </div>
        </div>
      </div>
    </>
  );
}
