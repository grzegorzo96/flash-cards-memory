import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';
import { navigationItems } from './NavigationConfig';
import { isActiveRoute } from '@/lib/helpers/navigation';

type SidebarProps = {
  user: {
    id: string;
    email: string;
  } | null;
};

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    // Listen to navigation events
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (
    <div 
      className="fixed left-0 top-0 h-full w-64 border-r bg-background flex flex-col"
      data-testid="sidebar"
    >
      {/* Header with Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-primary">FlashCards</h1>
        <p className="text-xs text-muted-foreground mt-1">Memory App</p>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 py-4">
        <nav aria-label="Main navigation" className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActiveRoute(currentPath, item.href)}
            />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* User Menu */}
      <UserMenu user={user} />
    </div>
  );
};

export default Sidebar;
