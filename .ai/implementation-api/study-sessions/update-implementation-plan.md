# API Endpoint Implementation Plan: PATCH /api/study-sessions/{sessionId}

## 1. Przegląd punktu końcowego
Punkt końcowy aktualizuje status sesji nauki (np. `completed` lub `abandoned`) i ustawia `ended_at`. W MVP brak autoryzacji, ale operacja musi być ograniczona do stałego/anonimowego `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `PATCH`
- Struktura URL: `/api/study-sessions/{sessionId}`
- Parametry:
  - Wymagane: `sessionId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  { "status": "completed" }
  ```
- Typy:
  - `UpdateStudySessionCommand`
  - `UpdateStudySessionResponseDTO`
  - `StudySession` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "id": "uuid", "status": "completed", "ended_at": "ts" }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. status spoza `in_progress|completed|abandoned`).
- `404 Not Found`:
  - Brak sesji o podanym `sessionId`.
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `PATCH` w `src/pages/api/study-sessions/[sessionId].ts` odbiera `sessionId` i JSON body.
2. Walidacja `sessionId` jako UUID (Zod).
3. Walidacja body Zod:
   - `status` wymagane, dozwolone wartości: `in_progress|completed|abandoned`.
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Pobranie sesji z `study_sessions` z filtrami `id` i `user_id`.
6. Jeśli brak rekordu → `404`.
7. Aktualizacja `status` oraz ustawienie `ended_at = now()` gdy status != `in_progress`.
8. Zwrócenie `UpdateStudySessionResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Brak ujawniania pól spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe.
- `404 NotFound`: brak sesji.
- `500 ServerError`: błędy Supabase.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `sessionId` i `user_id`.

## 7. Wydajność
- Jedno zapytanie SELECT + jedno UPDATE.
- Indeksy na `study_sessions.id` i `user_id` wspierają zapytania.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/study-sessions/[sessionId].ts` z `export const prerender = false`.
2. Zdefiniować schematy Zod dla `sessionId` i `UpdateStudySessionCommand`.
3. Wyodrębnić logikę do serwisu `src/lib/services/study-sessions` (np. `updateStudySession`).
4. Zaimplementować ustawianie `ended_at` przy zakończeniu.
5. Zwrócić `UpdateStudySessionResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, niepoprawny status, brak rekordu.
