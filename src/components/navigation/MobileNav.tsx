import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NavItem } from './NavItem';
import { UserMenu } from './UserMenu';
import { navigationItems } from './NavigationConfig';
import { isActiveRoute } from '@/lib/helpers/navigation';

type MobileNavProps = {
  user: {
    id: string;
    email: string;
  } | null;
};

const MobileNav: React.FC<MobileNavProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => 
    typeof window !== 'undefined' ? window.location.pathname : ''
  );

  useEffect(() => {
    // Listen to navigation events
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4" data-testid="mobile-nav">
      <div>
        <h1 className="text-xl font-bold text-primary">FlashCards</h1>
        <p className="text-xs text-muted-foreground">Memory App</p>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Open navigation menu"
            data-testid="mobile-menu-trigger"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-64 p-0 flex flex-col"
          data-testid="mobile-sidebar"
        >
          <SheetHeader className="p-6 border-b text-left">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 py-4">
            <nav aria-label="Main navigation" className="space-y-1 px-3">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActiveRoute(currentPath, item.href)}
                  onClick={handleNavClick}
                />
              ))}
            </nav>
          </ScrollArea>

          <Separator />

          <UserMenu user={user} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
