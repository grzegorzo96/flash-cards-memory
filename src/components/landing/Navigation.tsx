import { Button } from '@/components/ui/button';

type NavigationProps = {
  isGuest: boolean;
};

export function Navigation({ isGuest }: NavigationProps) {
  return (
    <nav className="border-b" data-testid="navigation">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary" data-testid="app-title">
            FlashCardsMemory
          </h1>
        </div>

        <div className="flex items-center gap-2" data-testid="navigation-actions">
          {isGuest ? (
            <>
              <Button variant="ghost" asChild data-testid="login-link">
                <a href="/login">Zaloguj się</a>
              </Button>
              <Button asChild data-testid="register-link">
                <a href="/register">Zarejestruj się</a>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild data-testid="dashboard-link">
                <a href="/dashboard">Dashboard</a>
              </Button>
              <form action="/logout" method="POST">
                <Button type="submit" variant="outline" data-testid="logout-button">
                  Wyloguj
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
