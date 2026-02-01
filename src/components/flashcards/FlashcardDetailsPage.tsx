import { useState, useCallback } from "react";
import { useFlashcard } from "@/components/hooks/useFlashcard";
import { useDeleteFlashcard } from "@/components/hooks/useDeleteFlashcard";
import { FlashcardDetailsHeader } from "./FlashcardDetailsHeader";
import { FlashcardDetailsCard } from "./FlashcardDetailsCard";
import { LoadingState } from "./FlashcardFormLoadingState";
import { ErrorBanner } from "../dashboard/ErrorBanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type FlashcardDetailsPageProps = {
  flashcardId: string;
};

export default function FlashcardDetailsPage({
  flashcardId,
}: FlashcardDetailsPageProps) {
  const { data: flashcard, isLoading, error, refetch } = useFlashcard(flashcardId);
  const { deleteFlashcard, isDeleting } = useDeleteFlashcard();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const success = await deleteFlashcard(flashcardId);
    if (success && flashcard) {
      window.location.href = `/decks/${flashcard.deck_id}`;
    }
  }, [flashcardId, flashcard, deleteFlashcard]);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <LoadingState />
      </main>
    );
  }

  if (error || !flashcard) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <ErrorBanner
          message={error || "Nie znaleziono fiszki"}
          onRetry={refetch}
        />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <FlashcardDetailsHeader
        flashcardId={flashcardId}
        deckId={flashcard.deck_id}
        onDelete={handleDelete}
      />
      <FlashcardDetailsCard flashcard={flashcard} />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń fiszkę</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć tę fiszkę? Ta akcja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm">
              <span className="font-semibold">Pytanie:</span> {flashcard.question}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Usuwanie..." : "Usuń fiszkę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
