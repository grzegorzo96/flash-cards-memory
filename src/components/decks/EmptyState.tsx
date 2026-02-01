import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Brak talii</h2>
          <p className="mt-2 text-muted-foreground">
            Utwórz swoją pierwszą talię, aby rozpocząć naukę
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href="/decks/new">Utwórz talię</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/generate/setup">Wygeneruj fiszki z AI</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
