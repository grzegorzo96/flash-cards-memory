# API Endpoint Implementation Plan: DELETE /api/flashcards/{flashcardId}

## 1. Przegląd punktu końcowego
Punkt końcowy wykonuje soft-delete fiszki poprzez ustawienie `deleted_at`. W MVP brak autoryzacji, ale operacja musi być ograniczona do stałego/anonimowego `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `DELETE`
- Struktura URL: `/api/flashcards/{flashcardId}`
- Parametry:
  - Wymagane: `flashcardId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `DeleteResponseDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "ok": true }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `flashcardId`.
- `404 Not Found`:
  - Brak fiszki o podanym `flashcardId` (lub już soft-usunięta).
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `DELETE` w `src/pages/api/flashcards/[flashcardId].ts` odbiera `flashcardId` ze ścieżki.
2. Walidacja `flashcardId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Weryfikacja istnienia fiszki z filtrami `id`, `user_id`, `deleted_at IS NULL`.
5. Jeśli brak rekordu → `404`.
6. Soft-delete fiszki: ustawienie `deleted_at = now()` oraz `updated_at`.
7. Zwrócenie `{ ok: true }` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja UUID zapobiega błędom zapytań i nadużyciom.
- Operacja nie usuwa danych trwale, co ułatwia audyt i odzysk.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `flashcardId`.
- `404 NotFound`: brak fiszki lub `deleted_at` ustawiony.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `flashcardId` i `user_id`.

## 7. Wydajność
- Jedno zapytanie UPDATE po PK `id`.
- Indeksy wspierają filtrowanie po `user_id` i `id`.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/flashcards/[flashcardId].ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schemat Zod dla `flashcardId`.
3. Wyodrębnić logikę do serwisu `src/lib/services/flashcards` (np. `deleteFlashcard`).
4. Zaimplementować filtr `deleted_at IS NULL`.
5. Zwrócić `DeleteResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, niepoprawny UUID, brak rekordu.
