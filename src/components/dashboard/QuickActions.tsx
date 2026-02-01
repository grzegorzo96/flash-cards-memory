import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szybkie akcje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="hover-glow scale-in">
            <a href="/generate/setup">Wygeneruj fiszki z AI</a>
          </Button>
          <Button variant="outline" asChild className="hover-lift scale-in" style={{ animationDelay: '0.1s' }}>
            <a href="/decks/new">Utwórz nową talię</a>
          </Button>
          <Button variant="outline" asChild className="hover-lift scale-in" style={{ animationDelay: '0.2s' }}>
            <a href="/decks">Przeglądaj wszystkie talie</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
