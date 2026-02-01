import type { DeckDetailsDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DeckDetailsHeaderProps = {
  deck: DeckDetailsDTO;
  cardCount: number;
  deckId: string;
};

export function DeckDetailsHeader({
  deck,
  cardCount,
  deckId,
}: DeckDetailsHeaderProps) {
  return (
    <header>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{deck.name}</h1>
            <Badge variant="secondary">
              {cardCount} {cardCount === 1 ? "karta" : "kart"}
            </Badge>
          </div>
          {deck.description && (
            <p className="mt-2 text-muted-foreground">{deck.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/decks/${deckId}/edit`}>Edytuj talię</a>
          </Button>
          <Button asChild>
            <a href={`/flashcards/new?deckId=${deckId}`}>Dodaj fiszkę</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
