# API Endpoint Implementation Plan: GET /api/study-sessions/{sessionId}/summary

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca podsumowanie sesji nauki, w tym liczbę ocenionych kart oraz rozkład ocen. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/study-sessions/{sessionId}/summary`
- Parametry:
  - Wymagane: `sessionId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `StudySessionSummaryResponseDTO`
  - `ReviewEvent` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "cards_reviewed": 20, "ratings": { "1": 2, "2": 5, "3": 9, "4": 4 } }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `sessionId`.
- `404 Not Found`:
  - Brak sesji o podanym `sessionId`.
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/study-sessions/[sessionId]/summary.ts` odbiera `sessionId`.
2. Walidacja `sessionId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Weryfikacja istnienia sesji w `study_sessions` (id + user_id).
5. Jeśli brak sesji → `404`.
6. Agregacja danych z `review_events`:
   - `cards_reviewed`: count(*) dla `study_session_id`.
   - `ratings`: count grupowany po `rating` (1–4).
7. Zwrócenie `StudySessionSummaryResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja UUID zapobiega błędom zapytań i nadużyciom.
- Brak ujawniania danych spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `sessionId`.
- `404 NotFound`: brak sesji.
- `500 ServerError`: błędy Supabase.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `sessionId` i `user_id`.

## 7. Wydajność
- Agregacja po indeksie `study_session_id`.
- Jedno zapytanie agregujące.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/study-sessions/[sessionId]/summary.ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `sessionId`.
3. Wyodrębnić logikę do serwisu `src/lib/services/study-sessions` (np. `getStudySessionSummary`).
4. Zaimplementować agregację ocen z `review_events`.
5. Zwrócić `StudySessionSummaryResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, brak sesji, niepoprawny UUID.
