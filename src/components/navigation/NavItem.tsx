import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick?: () => void;
};

export const NavItem = React.memo(
  ({ href, label, icon: Icon, isActive, onClick }: NavItemProps) => {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-md transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground font-semibold'
            : 'hover:bg-accent/50'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </a>
    );
  }
);

NavItem.displayName = 'NavItem';
