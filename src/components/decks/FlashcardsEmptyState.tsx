import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type FlashcardsEmptyStateProps = {
  deckId: string;
  hasSearchQuery: boolean;
};

export function EmptyState({
  deckId,
  hasSearchQuery,
}: FlashcardsEmptyStateProps) {
  if (hasSearchQuery) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Brak wyników</h2>
            <p className="mt-2 text-muted-foreground">
              Nie znaleziono fiszek pasujących do wyszukiwania
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Brak fiszek</h2>
          <p className="mt-2 text-muted-foreground">
            Ta talia nie zawiera jeszcze żadnych fiszek
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <a href={`/flashcards/new?deckId=${deckId}`}>Dodaj fiszkę</a>
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
