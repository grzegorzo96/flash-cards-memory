import { useEffect } from "react";
import { useFlashcard } from "@/components/hooks/useFlashcard";
import { useDecksList } from "@/components/hooks/useDecksList";
import { FlashcardFormHeader } from "./FlashcardFormHeader";
import { FlashcardForm } from "./FlashcardForm";
import { LoadingState } from "./FlashcardFormLoadingState";
import { ErrorBanner } from "../dashboard/ErrorBanner";

type FlashcardFormPageProps = {
  flashcardId?: string;
  deckId?: string | null;
};

export default function FlashcardFormPage({
  flashcardId,
  deckId,
}: FlashcardFormPageProps) {
  const isEditMode = !!flashcardId;
  const {
    data: flashcard,
    isLoading: isFlashcardLoading,
    error: flashcardError,
    refetch,
  } = useFlashcard(flashcardId || null);

  const {
    data: decksData,
    isLoading: isDecksLoading,
    error: decksError,
  } = useDecksList({ include_counts: false });

  useEffect(() => {
    if (isEditMode && flashcardError) {
      console.error("Failed to load flashcard:", flashcardError);
    }
  }, [isEditMode, flashcardError]);

  const isLoading = isFlashcardLoading || isDecksLoading;
  const error = flashcardError || decksError;

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <FlashcardFormHeader isEditMode={isEditMode} />
        <LoadingState />
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <FlashcardFormHeader isEditMode={isEditMode} />
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <FlashcardFormHeader isEditMode={isEditMode} />
      <FlashcardForm
        flashcardId={flashcardId}
        initialData={flashcard}
        initialDeckId={deckId || flashcard?.deck_id}
        decks={decksData?.items || []}
      />
    </main>
  );
}
