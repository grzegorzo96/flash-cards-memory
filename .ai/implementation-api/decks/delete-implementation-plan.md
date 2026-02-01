# API Endpoint Implementation Plan: DELETE /api/decks/{deckId}

## 1. Przegląd punktu końcowego
Punkt końcowy wykonuje soft-delete talii oraz powiązanych z nią fiszek poprzez ustawienie `deleted_at`. W MVP brak autoryzacji, ale operacja musi być ograniczona do stałego/anonimowego `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `DELETE`
- Struktura URL: `/api/decks/{deckId}`
- Parametry:
  - Wymagane: `deckId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `DeleteResponseDTO`
  - `Deck` / `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "ok": true }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `deckId`.
- `404 Not Found`:
  - Brak talii o podanym `deckId` (lub już soft-usunięta).
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `DELETE` w `src/pages/api/decks/[deckId].ts` odbiera `deckId` ze ścieżki.
2. Walidacja `deckId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Weryfikacja istnienia talii (`decks`) z filtrami `id`, `user_id`, `deleted_at IS NULL`.
5. Jeśli brak rekordu → `404`.
6. Soft-delete talii: ustawienie `deleted_at = now()` oraz `updated_at`.
7. Soft-delete powiązanych fiszek: ustawienie `deleted_at = now()` i `updated_at` dla `flashcards` o `deck_id`.
8. Zwrócenie `{ ok: true }` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja UUID zapobiega błędom zapytań i nadużyciom.
- Operacja nie usuwa danych trwale, co ułatwia audyt i odzysk.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `deckId`.
- `404 NotFound`: brak talii lub `deleted_at` ustawiony.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `deckId` i `user_id`.

## 7. Wydajność
- Dwie operacje UPDATE (decks + flashcards).
- Filtry po `deck_id` i `user_id` wspierane indeksami.

## 8. Kroki implementacji
1. Dodać handler `DELETE` w `src/pages/api/decks/[deckId].ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schemat Zod dla `deckId`.
3. Wyodrębnić logikę do serwisu `src/lib/services/decks` (np. `deleteDeck`).
4. Zaimplementować soft-delete talii oraz powiązanych fiszek w transakcji (jeśli możliwe).
5. Zwrócić `DeleteResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, niepoprawny UUID, brak rekordu.
