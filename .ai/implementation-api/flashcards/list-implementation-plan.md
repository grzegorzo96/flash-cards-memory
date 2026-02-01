# API Endpoint Implementation Plan: GET /api/decks/{deckId}/flashcards

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca listę fiszek w danej talii z paginacją, sortowaniem i opcjonalnym wyszukiwaniem pełnotekstowym. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id` oraz pomijać rekordy z `deleted_at`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/decks/{deckId}/flashcards`
- Parametry:
  - Wymagane: `deckId` (UUID w ścieżce)
  - Opcjonalne:
    - `limit` (number)
    - `offset` (number)
    - `sort` (`created_at|updated_at|next_due_at`)
    - `order` (`asc|desc`)
    - `q` (string, full-text search)
- Request Body: brak
- Typy:
  - `FlashcardListQueryDTO`
  - `FlashcardListResponseDTO`, `FlashcardListItemDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    {
      "items": [
        {
          "id": "uuid",
          "question": "What is a cell?",
          "answer": "The basic unit of life.",
          "source": "ai",
          "is_accepted": true,
          "source_language": "en",
          "target_language": "en",
          "last_reviewed_at": "ts",
          "next_due_at": "ts",
          "created_at": "ts",
          "updated_at": "ts"
        }
      ],
      "limit": 20,
      "offset": 0,
      "total": 120
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowe parametry (np. ujemny `limit`, nieznane `sort`).
- `404 Not Found`:
  - Brak talii o podanym `deckId`.
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/decks/[deckId]/flashcards.ts` odbiera `deckId` i query params.
2. Walidacja `deckId` jako UUID (Zod).
3. Walidacja query params (Zod):
   - `limit` i `offset` jako liczby nieujemne.
   - `sort` tylko z dozwolonego zestawu.
   - `order` tylko `asc|desc`.
   - `q` jako string (opcjonalne).
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Weryfikacja istnienia talii (`decks`) z filtrami `id`, `user_id`, `deleted_at IS NULL`.
6. Jeśli brak talii → `404`.
7. Zapytanie do `flashcards`:
   - Filtry: `deck_id = deckId`, `user_id`, `deleted_at IS NULL`.
   - Sortowanie: wg `sort` i `order` (domyślne wartości ustalić w implementacji).
   - Paginacja: `limit`, `offset`.
   - Jeśli `q` podane: użyć wyszukiwania pełnotekstowego (GIN) na `question`/`answer`.
8. Zwrócenie `FlashcardListResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja wejścia ogranicza nadużycia (np. ekstremalne `limit`).
- Nie zwracać fiszek z `deleted_at`.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe parametry query lub `deckId`.
- `404 DeckNotFound`: brak talii.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `deckId`, `user_id` i parametrami.

## 7. Wydajność
- Indeksy na `deck_id` i GIN dla wyszukiwania wspierają szybkie zapytania.
- Stosować limit maksymalny dla `limit` (np. 50/100).

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/decks/[deckId]/flashcards.ts` z `export const prerender = false`.
2. Zdefiniować schematy Zod dla `deckId` i `FlashcardListQueryDTO`.
3. Wyodrębnić logikę do serwisu `src/lib/services/flashcards` (np. `listFlashcardsByDeck`).
4. Zaimplementować weryfikację istnienia talii i filtr `deleted_at IS NULL`.
5. Dodać wyszukiwanie pełnotekstowe przy `q`.
6. Zwrócić `FlashcardListResponseDTO` z `200`.
7. Dodać testy integracyjne: sukces, walidacja query, brak talii, wyszukiwanie.
