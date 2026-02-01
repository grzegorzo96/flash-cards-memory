import { Button } from '@/components/ui/button';

type NavigationProps = {
  isGuest: boolean;
};

export function Navigation({ isGuest }: NavigationProps) {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-primary">FlashCardsMemory</h1>
        </div>

        <div className="flex items-center gap-2">
          {isGuest ? (
            <>
              <Button variant="ghost" asChild>
                <a href="/login">Zaloguj się</a>
              </Button>
              <Button asChild>
                <a href="/register">Zarejestruj się</a>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              <form action="/logout" method="POST">
                <Button type="submit" variant="outline">
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
