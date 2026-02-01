import { useState, useCallback, useEffect } from "react";
import type { ReviewRating, StudySessionCardDTO } from "@/types";
import { useStudySession } from "@/components/hooks/useStudySession";
import { useCreateReviewEvent } from "@/components/hooks/useCreateReviewEvent";
import { useUpdateStudySession } from "@/components/hooks/useUpdateStudySession";
import { StudyHeader } from "./StudyHeader";
import { FlashcardPrompt } from "./FlashcardPrompt";
import { RatingPanel } from "./RatingPanel";
import { KeyboardHints } from "./KeyboardHints";
import { ErrorBanner } from "../dashboard/ErrorBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StudySessionPageProps = {
  sessionId: string;
};

export default function StudySessionPage({ sessionId }: StudySessionPageProps) {
  const { data: session, isLoading, error } = useStudySession(sessionId);
  const { createReviewEvent, isCreating } = useCreateReviewEvent();
  const { updateStudySession } = useUpdateStudySession();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [cards, setCards] = useState<StudySessionCardDTO[]>([]);

  useEffect(() => {
    if (session?.cards) {
      setCards(session.cards);
    }
  }, [session]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;
  const isLastCard = currentIndex === cards.length - 1;

  const handleShowAnswer = useCallback(() => {
    setIsAnswerVisible(true);
  }, []);

  const handleRating = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return;

      const result = await createReviewEvent(sessionId, {
        flashcard_id: currentCard.id,
        rating,
      });

      if (result) {
        if (isLastCard) {
          await updateStudySession(sessionId, { status: "completed" });
          window.location.href = `/study/${sessionId}/summary`;
        } else {
          setCurrentIndex((prev) => prev + 1);
          setIsAnswerVisible(false);
        }
      }
    },
    [currentCard, sessionId, isLastCard, createReviewEvent, updateStudySession]
  );

  const handleEndSession = useCallback(async () => {
    await updateStudySession(sessionId, { status: "completed" });
    window.location.href = `/study/${sessionId}/summary`;
  }, [sessionId, updateStudySession]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isCreating) return;

      if (e.key === " " && !isAnswerVisible) {
        e.preventDefault();
        handleShowAnswer();
      } else if (isAnswerVisible && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        handleRating(parseInt(e.key) as ReviewRating);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isAnswerVisible, isCreating, handleShowAnswer, handleRating]);

  if (isLoading) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <p>Ładowanie sesji nauki...</p>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorBanner
          message={error || "Nie znaleziono sesji nauki"}
          onRetry={() => (window.location.href = "/dashboard")}
        />
      </main>
    );
  }

  if (cards.length === 0) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-2xl font-semibold">Brak kart do nauki</h2>
            <p className="mt-2 text-muted-foreground">
              Ta sesja nie zawiera żadnych kart do powtórki
            </p>
            <Button className="mt-6" asChild>
              <a href="/dashboard">Wróć do dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <StudyHeader
          currentIndex={currentIndex}
          totalCards={cards.length}
          progress={progress}
          onEndSession={handleEndSession}
        />

        <div className="mt-8">
          <FlashcardPrompt
            card={currentCard}
            isAnswerVisible={isAnswerVisible}
            onShowAnswer={handleShowAnswer}
          />

          {isAnswerVisible && (
            <div className="mt-6">
              <RatingPanel onRate={handleRating} isSubmitting={isCreating} />
            </div>
          )}

          <KeyboardHints isAnswerVisible={isAnswerVisible} />
        </div>
      </div>
    </main>
  );
}
