# API Endpoint Implementation Plan: POST /api/study-sessions

## 1. Przegląd punktu końcowego
Punkt końcowy rozpoczyna sesję nauki dla talii i zwraca zestaw kart do przeglądu. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/study-sessions`
- Parametry:
  - Wymagane: brak w query/path
  - Opcjonalne: brak w query/path
- Request Body:
  ```json
  { "deck_id": "uuid" }
  ```
- Typy:
  - `StartStudySessionCommand`
  - `StartStudySessionResponseDTO`
  - `StudySession` / `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `201 Created`:
  - Body:
    ```json
    {
      "id": "uuid",
      "status": "in_progress",
      "cards": [
        { "id": "uuid", "question": "...", "answer": "..." }
      ]
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. brak `deck_id`).
- `404 Not Found`:
  - Brak talii o podanym `deck_id`.
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/study-sessions/index.ts` odbiera JSON body.
2. Walidacja body Zod:
   - `deck_id` wymagane (UUID).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Weryfikacja istnienia talii (`decks`) z filtrami `id`, `user_id`, `deleted_at IS NULL`.
5. Jeśli brak talii → `404`.
6. Utworzenie rekordu w `study_sessions` ze statusem `in_progress`.
7. Pobranie zestawu kart do nauki (np. wg `next_due_at`/`last_reviewed_at`).
8. Zwrócenie `StartStudySessionResponseDTO` z `201`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Nie zwracać kart z `deleted_at`.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe.
- `404 DeckNotFound`: brak talii.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `deck_id` i `user_id`.

## 7. Wydajność
- Jedno zapytanie INSERT + zapytanie SELECT na karty.
- Indeksy na `next_due_at` i `last_reviewed_at` wspierają dobór kart.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/study-sessions/index.ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `StartStudySessionCommand`.
3. Wyodrębnić logikę do serwisu `src/lib/services/study-sessions` (np. `startStudySession`).
4. Zaimplementować wybór kart do sesji (polityka do ustalenia: due-first).
5. Zwrócić `StartStudySessionResponseDTO` z `201`.
6. Dodać testy integracyjne: sukces, brak talii, walidacja.
