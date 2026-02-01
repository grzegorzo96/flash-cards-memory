import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getUserInitials } from '@/lib/helpers/navigation';

type UserMenuProps = {
  user: {
    id: string;
    email: string;
  } | null;
};

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  if (!user) {
    return null;
  }

  const initials = getUserInitials(user.email);

  const handleLogout = async () => {
    // Submit logout form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout';
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="border-t bg-background" data-testid="user-menu">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3" data-testid="user-info">
          <div 
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
            data-testid="user-avatar"
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="user-email">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">Zalogowany</p>
          </div>
        </div>
        <Separator />
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start"
          size="sm"
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Wyloguj się
        </Button>
      </div>
    </div>
  );
};
