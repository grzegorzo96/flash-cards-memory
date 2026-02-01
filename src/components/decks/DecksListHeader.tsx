import { Button } from "@/components/ui/button";

export function DecksListHeader() {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Talie</h1>
        <p className="mt-2 text-muted-foreground">
          Zarządzaj swoimi taliami fiszek
        </p>
      </div>
      <Button asChild>
        <a href="/decks/new">Utwórz talię</a>
      </Button>
    </header>
  );
}
