import { useEffect } from "react";
import { useDeck } from "@/components/hooks/useDeck";
import { DeckFormHeader } from "./DeckFormHeader";
import { DeckForm } from "./DeckForm";
import { LoadingState as FormLoadingState } from "./FormLoadingState";
import { ErrorBanner } from "../dashboard/ErrorBanner";

type DeckFormPageProps = {
  deckId?: string;
};

export default function DeckFormPage({ deckId }: DeckFormPageProps) {
  const isEditMode = !!deckId;
  const { data: deck, isLoading, error, refetch } = useDeck(deckId || null);

  useEffect(() => {
    if (isEditMode && error) {
      console.error("Failed to load deck:", error);
    }
  }, [isEditMode, error]);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <DeckFormHeader isEditMode={isEditMode} />
        <FormLoadingState />
      </main>
    );
  }

  if (error && isEditMode) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <DeckFormHeader isEditMode={isEditMode} />
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <DeckFormHeader isEditMode={isEditMode} />
      <DeckForm deckId={deckId} initialData={deck} />
    </main>
  );
}
