import { useState, useCallback } from 'react';
import { useDecksList } from '@/components/hooks/useDecksList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Clock } from 'lucide-react';
import { ErrorBanner } from '../dashboard/ErrorBanner';

export default function StudyListPage() {
  const [startingDeckId, setStartingDeckId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useDecksList({
    limit: 100,
    offset: 0,
    sort: 'name',
    order: 'asc',
    include_counts: true,
  });

  const handleStartStudy = useCallback(
    async (deckId: string) => {
      setStartingDeckId(deckId);
      try {
        const response = await fetch('/api/study-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deck_id: deckId }),
        });

        if (!response.ok) {
          throw new Error('Failed to start study session');
        }

        const result = await response.json();
        window.location.href = `/study/${result.id}`;
      } catch (err) {
        console.error('Error starting study session:', err);
        alert('Nie udało się rozpocząć sesji nauki. Spróbuj ponownie.');
        setStartingDeckId(null);
      }
    },
    []
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Nauka
          </h1>
          <p className="text-muted-foreground mt-2">
            Ładowanie dostępnych talii...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Nauka
          </h1>
        </div>
        <ErrorBanner message={error} onRetry={refetch} />
      </main>
    );
  }

  const decks = data?.items || [];
  const decksWithCards = decks.filter((deck) => (deck.card_count || 0) > 0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Nauka
        </h1>
        <p className="text-muted-foreground mt-2">
          Wybierz talię, aby rozpocząć sesję nauki
        </p>
      </div>

      {decksWithCards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold">Brak talii z fiszkami</h2>
            <p className="mt-2 text-muted-foreground">
              Utwórz talię i dodaj fiszki, aby rozpocząć naukę
            </p>
            <Button className="mt-6" asChild>
              <a href="/decks/new">Utwórz pierwszą talię</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decksWithCards.map((deck) => (
            <Card
              key={deck.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2">{deck.name}</span>
                  {deck.language && (
                    <Badge variant="outline" className="shrink-0">
                      {deck.language}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deck.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {deck.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{deck.card_count || 0} fiszek</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleStartStudy(deck.id)}
                  disabled={startingDeckId === deck.id}
                >
                  {startingDeckId === deck.id ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Rozpoczynam...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Rozpocznij naukę
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
