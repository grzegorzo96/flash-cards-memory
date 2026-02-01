import { useState, useCallback, useEffect } from "react";
import type { PreviewCardDTO, AcceptedCardInputDTO } from "@/types";
import { useGenerationStatus } from "@/components/hooks/useGenerationStatus";
import { useAcceptGeneratedCards } from "@/components/hooks/useAcceptGeneratedCards";
import { useDecksList } from "@/components/hooks/useDecksList";
import { useCreateDeck } from "@/components/hooks/useCreateDeck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewCardItem } from "./PreviewCardItem";
import { ErrorBanner } from "../dashboard/ErrorBanner";
import { AuthRequiredDialog } from "./AuthRequiredDialog";

type GeneratePreviewPageProps = {
  requestId: string | null;
  isGuest?: boolean;
};

export default function GeneratePreviewPage({
  requestId,
  isGuest = false,
}: GeneratePreviewPageProps) {
  const { data: generationData, isLoading, error } = useGenerationStatus(requestId, false);
  const { data: decksData, refetch: refetchDecks } = useDecksList({ include_counts: false });
  const { acceptCards, isAccepting } = useAcceptGeneratedCards();
  const { createDeck, isCreating } = useCreateDeck();

  const [cards, setCards] = useState<PreviewCardDTO[]>([]);
  const [deckId, setDeckId] = useState<string>("");
  const [newDeckName, setNewDeckName] = useState("");
  const [showNewDeckForm, setShowNewDeckForm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!requestId) {
      window.location.href = "/generate/input";
    }
  }, [requestId]);

  useEffect(() => {
    if (generationData?.preview_cards) {
      setCards(generationData.preview_cards);
    }
  }, [generationData]);

  // Restore edited cards from sessionStorage after login
  useEffect(() => {
    const savedCards = sessionStorage.getItem('guest_edited_cards');
    if (savedCards && !isGuest && cards.length === 0) {
      try {
        const parsedCards = JSON.parse(savedCards);
        setCards(parsedCards);
        sessionStorage.removeItem('guest_edited_cards');
      } catch (e) {
        console.error('Failed to restore guest cards:', e);
      }
    }
  }, [isGuest, cards.length]);

  const handleCardEdit = useCallback(
    (index: number, field: "question" | "answer", value: string) => {
      setCards((prev) =>
        prev.map((card, i) =>
          i === index ? { ...card, [field]: value } : card
        )
      );
    },
    []
  );

  const handleCardDelete = useCallback((index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCreateNewDeck = useCallback(async () => {
    if (!newDeckName.trim()) return;

    const result = await createDeck({ name: newDeckName, description: undefined });
    if (result) {
      setDeckId(result.id);
      setShowNewDeckForm(false);
      setNewDeckName("");
      await refetchDecks();
    }
  }, [newDeckName, createDeck, refetchDecks]);

  const handleAcceptCards = useCallback(async () => {
    // If guest, save cards to sessionStorage and show auth dialog
    if (isGuest) {
      sessionStorage.setItem('guest_edited_cards', JSON.stringify(cards));
      setShowAuthDialog(true);
      return;
    }

    if (!requestId || !deckId || cards.length === 0) {
      setSubmitError("Wybierz talię i upewnij się, że masz przynajmniej jedną fiszkę");
      return;
    }

    setSubmitError(null);

    const acceptedCards: AcceptedCardInputDTO[] = cards.map((card) => ({
      question: card.question,
      answer: card.answer,
      original_question: card.question,
      original_answer: card.answer,
      source: card.source,
      is_accepted: true,
      source_language: "pl",
      target_language: "en",
    }));

    const result = await acceptCards(requestId, {
      deck_id: deckId,
      cards: acceptedCards,
    });

    if (result) {
      window.location.href = `/decks/${deckId}`;
    } else {
      setSubmitError("Nie udało się zapisać fiszek. Spróbuj ponownie.");
    }
  }, [isGuest, requestId, deckId, cards, acceptCards]);

  if (!requestId) {
    return null;
  }

  if (error) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorBanner message={error} />
      </main>
    );
  }

  if (isLoading || !generationData) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <p>Ładowanie...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Podgląd wygenerowanych fiszek
        </h1>
        <p className="mt-2 text-muted-foreground">
          Sprawdź i edytuj fiszki przed zapisaniem
        </p>
      </header>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {!isGuest && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wybierz talię</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showNewDeckForm ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="deck-select">Talia</Label>
                  <Select value={deckId} onValueChange={setDeckId}>
                    <SelectTrigger id="deck-select">
                      <SelectValue placeholder="Wybierz talię" />
                    </SelectTrigger>
                    <SelectContent>
                      {decksData?.items.map((deck) => (
                        <SelectItem key={deck.id} value={deck.id}>
                          {deck.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowNewDeckForm(true)}
                >
                  Utwórz nową talię
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-deck-name">Nazwa nowej talii</Label>
                  <Input
                    id="new-deck-name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                    placeholder="Nazwa talii..."
                    disabled={isCreating}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNewDeck} disabled={isCreating}>
                    {isCreating ? "Tworzenie..." : "Utwórz"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewDeckForm(false)}
                    disabled={isCreating}
                  >
                    Anuluj
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-semibold">
          Fiszki ({cards.length})
        </h2>
        {cards.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                Brak fiszek do wyświetlenia
              </p>
            </CardContent>
          </Card>
        ) : (
          cards.map((card, index) => (
            <PreviewCardItem
              key={index}
              card={card}
              index={index}
              onEdit={handleCardEdit}
              onDelete={handleCardDelete}
            />
          ))
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAcceptCards}
          disabled={isAccepting || cards.length === 0 || (!isGuest && !deckId)}
        >
          {isAccepting ? "Zapisywanie..." : isGuest ? "Zapisz fiszki (wymagane logowanie)" : "Zapisz fiszki"}
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = isGuest ? "/" : "/generate/input")}
          disabled={isAccepting}
        >
          Anuluj
        </Button>
      </div>

      <AuthRequiredDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        redirectUrl={`/generate/preview?requestId=${requestId}`}
      />
    </main>
  );
}
