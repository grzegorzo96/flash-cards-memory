import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="mt-8 scale-in">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Brak talii</h2>
          <p className="mt-2 text-muted-foreground text-reveal" style={{ animationDelay: '0.2s' }}>
            Zacznij od wygenerowania fiszek z AI lub stworzenia własnej talii
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="hover-glow scale-in" style={{ animationDelay: '0.3s' }}>
              <a href="/generate/setup">Wygeneruj fiszki z AI</a>
            </Button>
            <Button variant="outline" asChild className="hover-lift scale-in" style={{ animationDelay: '0.4s' }}>
              <a href="/decks/new">Utwórz nową talię</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
