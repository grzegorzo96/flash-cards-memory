import { useState, useCallback } from "react";
import type { FlashcardSortField, ApiSortOrder } from "@/types";
import { useDeck } from "@/components/hooks/useDeck";
import { useDeckFlashcards } from "@/components/hooks/useDeckFlashcards";
import { useDeleteFlashcard } from "@/components/hooks/useDeleteFlashcard";
import { DeckDetailsHeader } from "./DeckDetailsHeader";
import { FlashcardsSearch } from "./FlashcardsSearch";
import { FlashcardsList } from "./FlashcardsList";
import { Pagination } from "./Pagination";
import { LoadingState as DetailsLoadingState } from "./DetailsLoadingState";
import { EmptyState as FlashcardsEmptyState } from "./FlashcardsEmptyState";
import { ErrorBanner } from "../dashboard/ErrorBanner";
import { DeleteFlashcardDialog } from "./DeleteFlashcardDialog";

const DEFAULT_LIMIT = 20;

type DeckDetailsPageProps = {
  deckId: string;
};

export default function DeckDetailsPage({ deckId }: DeckDetailsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort] = useState<FlashcardSortField>("created_at");
  const [order] = useState<ApiSortOrder>("desc");
  const [offset, setOffset] = useState(0);
  const [flashcardToDelete, setFlashcardToDelete] = useState<{
    id: string;
    question: string;
  } | null>(null);

  const { data: deck, isLoading: isDeckLoading, error: deckError } = useDeck(deckId);
  
  const {
    data: flashcardsData,
    isLoading: isFlashcardsLoading,
    error: flashcardsError,
    refetch,
  } = useDeckFlashcards(deckId, {
    limit: DEFAULT_LIMIT,
    offset,
    sort,
    order,
    q: searchQuery || undefined,
  });

  const { deleteFlashcard, isDeleting } = useDeleteFlashcard();

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setOffset(0);
  }, []);

  const handlePageChange = useCallback((newOffset: number) => {
    setOffset(newOffset);
  }, []);

  const handleOpenFlashcard = useCallback((flashcardId: string) => {
    window.location.href = `/flashcards/${flashcardId}`;
  }, []);

  const handleEditFlashcard = useCallback((flashcardId: string) => {
    window.location.href = `/flashcards/${flashcardId}/edit`;
  }, []);

  const handleDeleteFlashcard = useCallback(
    (flashcardId: string, question: string) => {
      setFlashcardToDelete({ id: flashcardId, question });
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!flashcardToDelete) return;

    const success = await deleteFlashcard(flashcardToDelete.id);
    if (success) {
      setFlashcardToDelete(null);
      refetch();
    }
  }, [flashcardToDelete, deleteFlashcard, refetch]);

  const isLoading = isDeckLoading || isFlashcardsLoading;
  const error = deckError || flashcardsError;

  if (isLoading && !deck) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DetailsLoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  if (!deck) {
    return (
      <main className="container mx-auto px-4 py-8">
        <ErrorBanner
          message="Nie znaleziono talii"
          onRetry={() => (window.location.href = "/decks")}
        />
      </main>
    );
  }

  const hasFlashcards = flashcardsData && flashcardsData.items.length > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <DeckDetailsHeader
        deck={deck}
        cardCount={flashcardsData?.total || 0}
        deckId={deckId}
      />

      <div className="mt-8 space-y-6">
        <FlashcardsSearch
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {isFlashcardsLoading ? (
          <DetailsLoadingState />
        ) : hasFlashcards ? (
          <>
            <FlashcardsList
              flashcards={flashcardsData.items}
              onOpen={handleOpenFlashcard}
              onEdit={handleEditFlashcard}
              onDelete={handleDeleteFlashcard}
            />

            <Pagination
              limit={flashcardsData.limit}
              offset={flashcardsData.offset}
              total={flashcardsData.total}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <FlashcardsEmptyState deckId={deckId} hasSearchQuery={!!searchQuery} />
        )}
      </div>

      <DeleteFlashcardDialog
        isOpen={!!flashcardToDelete}
        flashcardQuestion={flashcardToDelete?.question || ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setFlashcardToDelete(null)}
      />
    </main>
  );
}
