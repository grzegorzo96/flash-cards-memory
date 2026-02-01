import { Button } from "@/components/ui/button";

type FlashcardDetailsHeaderProps = {
  flashcardId: string;
  deckId: string;
  onDelete: () => void;
};

export function FlashcardDetailsHeader({
  flashcardId,
  deckId,
  onDelete,
}: FlashcardDetailsHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Szczegóły fiszki</h1>
          <p className="mt-2 text-muted-foreground">
            Przeglądaj i zarządzaj fiszką
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/decks/${deckId}`}>Powrót do talii</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/flashcards/${flashcardId}/edit`}>Edytuj</a>
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Usuń
          </Button>
        </div>
      </div>
    </header>
  );
}
