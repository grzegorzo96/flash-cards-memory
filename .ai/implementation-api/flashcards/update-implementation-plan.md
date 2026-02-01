# API Endpoint Implementation Plan: PATCH /api/flashcards/{flashcardId}

## 1. Przegląd punktu końcowego
Punkt końcowy aktualizuje treść pytania i/lub odpowiedzi dla istniejącej fiszki. W MVP brak autoryzacji, ale operacja musi być ograniczona do stałego/anonimowego `user_id`. Fiszka soft-usunięta nie powinna być edytowalna.

## 2. Szczegóły żądania
- Metoda HTTP: `PATCH`
- Struktura URL: `/api/flashcards/{flashcardId}`
- Parametry:
  - Wymagane: `flashcardId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  { "question": "Updated?", "answer": "Updated." }
  ```
- Typy:
  - `UpdateFlashcardCommand`
  - `UpdateFlashcardResponseDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "id": "uuid", "updated_at": "ts" }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. długość > 2000, puste body).
- `404 Not Found`:
  - Brak fiszki o podanym `flashcardId` (lub została soft-usunięta).
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `PATCH` w `src/pages/api/flashcards/[flashcardId].ts` odbiera `flashcardId` i JSON body.
2. Walidacja `flashcardId` jako UUID (Zod).
3. Walidacja body Zod:
   - `question` opcjonalne, 1–2000 znaków.
   - `answer` opcjonalne, 1–2000 znaków.
   - Wymagane co najmniej jedno z pól.
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Pobranie fiszki z `flashcards` z filtrami `id`, `user_id`, `deleted_at IS NULL`.
6. Jeśli brak rekordu → `404`.
7. Aktualizacja rekordu i ustawienie `updated_at`.
8. Zwrócenie `UpdateFlashcardResponseDTO` i statusu `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Brak ujawniania pól spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `flashcardId`, niepoprawne dane lub puste body.
- `404 NotFound`: brak fiszki lub `deleted_at` ustawiony.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `flashcardId`, `user_id` i payloadem.

## 7. Wydajność
- Jedno pobranie rekordu + jedno zapytanie UPDATE.
- Indeksy wspierają filtrowanie po `user_id` i `id`.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/flashcards/[flashcardId].ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schematy Zod dla `flashcardId` i `UpdateFlashcardCommand` (wymagane min. jedno pole).
3. Wyodrębnić logikę aktualizacji do serwisu `src/lib/services/flashcards` (np. `updateFlashcard`).
4. Zaimplementować filtr `deleted_at IS NULL`.
5. Zwrócić `UpdateFlashcardResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, puste body, brak rekordu.
