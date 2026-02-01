import { useCallback } from "react";
import type { DashboardDeckDTO } from "@/types";
import { DeckOverviewItem } from "./DeckOverviewItem";

type DecksOverviewListProps = {
  decks: DashboardDeckDTO[];
};

export function DecksOverviewList({ decks }: DecksOverviewListProps) {
  const handleOpenDeck = useCallback((deckId: string) => {
    window.location.href = `/decks/${deckId}`;
  }, []);

  const handleStartStudy = useCallback(async (deckId: string) => {
    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deck_id: deckId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start study session");
      }

      const data = await response.json();
      window.location.href = `/study/${data.id}`;
    } catch (error) {
      console.error("Error starting study session:", error);
      alert("Nie udało się rozpocząć sesji nauki. Spróbuj ponownie.");
    }
  }, []);

  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Twoje talie</h2>
      <ul className="space-y-3" role="list">
        {decks.map((deck) => (
          <DeckOverviewItem
            key={deck.id}
            deck={deck}
            onOpen={handleOpenDeck}
            onStartStudy={handleStartStudy}
          />
        ))}
      </ul>
    </section>
  );
}
