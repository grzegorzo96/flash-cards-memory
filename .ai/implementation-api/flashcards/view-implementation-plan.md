# API Endpoint Implementation Plan: GET /api/flashcards/{flashcardId}

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca szczegóły pojedynczej fiszki. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id` oraz pomijać rekordy z `deleted_at`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/flashcards/{flashcardId}`
- Parametry:
  - Wymagane: `flashcardId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `GetFlashcardResponseDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "id": "uuid", "question": "...", "answer": "...", "deck_id": "uuid" }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `flashcardId`.
- `404 Not Found`:
  - Brak fiszki o podanym `flashcardId` (lub została soft-usunięta).
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/flashcards/[flashcardId].ts` odbiera `flashcardId` ze ścieżki.
2. Walidacja `flashcardId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Zapytanie do tabeli `flashcards`:
   - Filtry: `id = flashcardId`, `user_id = <system_user_id/anon_id>`, `deleted_at IS NULL`.
5. Jeśli nie znaleziono rekordu → `404`.
6. Mapowanie do `GetFlashcardResponseDTO` i zwrot `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja UUID zapobiega błędom zapytań i nadużyciom.
- Brak ujawniania pól spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `flashcardId`.
- `404 NotFound`: brak fiszki lub `deleted_at` ustawiony.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `flashcardId` i `user_id`.

## 7. Wydajność
- Zapytanie po PK `id` + filtr `user_id` i `deleted_at` jest szybkie (PK/indeksy).
- Minimalny response payload.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/flashcards/[flashcardId].ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `flashcardId` (UUID).
3. Wyodrębnić logikę pobierania fiszki do serwisu `src/lib/services/flashcards` (np. `getFlashcardById`).
4. Zaimplementować filtr `deleted_at IS NULL`.
5. Zwrócić `GetFlashcardResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, niepoprawny UUID, brak rekordu.
