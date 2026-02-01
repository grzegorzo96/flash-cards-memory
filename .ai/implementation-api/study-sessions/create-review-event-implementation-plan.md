# API Endpoint Implementation Plan: POST /api/study-sessions/{sessionId}/review-events

## 1. Przegląd punktu końcowego
Punkt końcowy zapisuje ocenę powtórki fiszki i aktualizuje harmonogram (FSRS) w `flashcards`. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/study-sessions/{sessionId}/review-events`
- Parametry:
  - Wymagane: `sessionId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  { "flashcard_id": "uuid", "rating": 3 }
  ```
- Typy:
  - `CreateReviewEventCommand`
  - `CreateReviewEventResponseDTO`
  - `ReviewEvent` / `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `201 Created`:
  - Body:
    ```json
    {
      "review_event_id": "uuid",
      "next_due_at": "ts",
      "stability": 2.5,
      "difficulty": 3.1,
      "retrievability": 0.87
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. `rating` poza 1–4).
- `404 Not Found`:
  - Brak sesji `sessionId` lub brak fiszki `flashcard_id`.
- `500 Internal Server Error`:
  - Błąd zapisu lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/study-sessions/[sessionId]/review-events.ts` odbiera `sessionId` i JSON body.
2. Walidacja `sessionId` jako UUID (Zod).
3. Walidacja body Zod:
   - `flashcard_id` wymagane (UUID).
   - `rating` wymagane, 1–4.
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Weryfikacja istnienia sesji `study_sessions` z filtrami `id`, `user_id`.
6. Weryfikacja istnienia fiszki `flashcards` z filtrami `id`, `user_id`, `deleted_at IS NULL`.
7. Wyliczenie nowych parametrów FSRS (`stability`, `difficulty`, `retrievability`, `next_due_at`).
8. Insert do `review_events` z powiązaniem do `study_session_id` i `flashcard_id`.
9. Aktualizacja `flashcards.next_due_at` i `last_reviewed_at`.
10. Zwrócenie `CreateReviewEventResponseDTO` z `201`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Nie ujawniać danych spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe.
- `404 NotFound`: brak sesji lub fiszki.
- `500 ServerError`: błędy Supabase/FSRS.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `sessionId`, `flashcard_id`, `user_id`.

## 7. Wydajność
- Operacje: INSERT `review_events` + UPDATE `flashcards`.
- Indeksy na `flashcard_id` i `study_session_id` wspierają zapytania.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/study-sessions/[sessionId]/review-events.ts` z `export const prerender = false`.
2. Zdefiniować schematy Zod dla `sessionId` i `CreateReviewEventCommand`.
3. Wyodrębnić logikę do serwisu `src/lib/services/study-sessions` (np. `createReviewEvent`).
4. Zaimplementować obliczenia FSRS i aktualizację fiszki.
5. Zwrócić `CreateReviewEventResponseDTO` z `201`.
6. Dodać testy integracyjne: sukces, walidacja rating, brak sesji/fiszki.
