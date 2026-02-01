import { useState, useCallback } from "react";
import type { DeckSortField, ApiSortOrder } from "@/types";
import { useDecksList } from "@/components/hooks/useDecksList";
import { useDeleteDeck } from "@/components/hooks/useDeleteDeck";
import { DecksListHeader } from "./DecksListHeader";
import { DecksFilters } from "./DecksFilters";
import { DecksTable } from "./DecksTable";
import { Pagination } from "./Pagination";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "../dashboard/ErrorBanner";
import { DeleteDeckDialog } from "./DeleteDeckDialog";

const DEFAULT_LIMIT = 20;

export default function DecksListPage() {
  const [sort, setSort] = useState<DeckSortField>("created_at");
  const [order, setOrder] = useState<ApiSortOrder>("desc");
  const [offset, setOffset] = useState(0);
  const [deckToDelete, setDeckToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, error, refetch } = useDecksList({
    limit: DEFAULT_LIMIT,
    offset,
    sort,
    order,
    include_counts: true,
  });

  const { deleteDeck, isDeleting } = useDeleteDeck();

  const handleSortChange = useCallback((newSort: DeckSortField) => {
    setSort(newSort);
    setOffset(0);
  }, []);

  const handleOrderChange = useCallback((newOrder: ApiSortOrder) => {
    setOrder(newOrder);
    setOffset(0);
  }, []);

  const handlePageChange = useCallback((newOffset: number) => {
    setOffset(newOffset);
  }, []);

  const handleOpenDeck = useCallback((deckId: string) => {
    window.location.href = `/decks/${deckId}`;
  }, []);

  const handleEditDeck = useCallback((deckId: string) => {
    window.location.href = `/decks/${deckId}/edit`;
  }, []);

  const handleDeleteDeck = useCallback((deckId: string, deckName: string) => {
    setDeckToDelete({ id: deckId, name: deckName });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deckToDelete) return;

    const success = await deleteDeck(deckToDelete.id);
    if (success) {
      setDeckToDelete(null);
      refetch();
    }
  }, [deckToDelete, deleteDeck, refetch]);

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

      const result = await response.json();
      window.location.href = `/study/${result.id}`;
    } catch (err) {
      console.error("Error starting study session:", err);
      alert("Nie udało się rozpocząć sesji nauki. Spróbuj ponownie.");
    }
  }, []);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DecksListHeader />
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DecksListHeader />
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <DecksListHeader />
        <EmptyState />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <DecksListHeader />

      <div className="mt-8 space-y-6">
        <DecksFilters
          sort={sort}
          order={order}
          onSortChange={handleSortChange}
          onOrderChange={handleOrderChange}
        />

        <DecksTable
          decks={data.items}
          onOpen={handleOpenDeck}
          onEdit={handleEditDeck}
          onDelete={handleDeleteDeck}
          onStartStudy={handleStartStudy}
        />

        <Pagination
          limit={data.limit}
          offset={data.offset}
          total={data.total}
          onPageChange={handlePageChange}
        />
      </div>

      <DeleteDeckDialog
        isOpen={!!deckToDelete}
        deckName={deckToDelete?.name || ""}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeckToDelete(null)}
      />
    </main>
  );
}
