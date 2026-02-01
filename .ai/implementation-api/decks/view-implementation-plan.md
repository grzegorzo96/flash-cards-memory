# API Endpoint Implementation Plan: GET /api/decks/{deckId}

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca szczegóły pojedynczej talii (deck) dla podanego identyfikatora. W MVP brak autoryzacji użytkowników, ale zapytanie powinno filtrować dane po stałym/anonimowym `user_id` zgodnie ze schematem bazy.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/decks/{deckId}`
- Parametry:
  - Wymagane: `deckId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `GetDeckResponseDTO`, `DeckDetailsDTO`
  - `Deck` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "id": "uuid", "name": "Biology", "description": "Cell biology" }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `deckId` (np. brak UUID).
- `404 Not Found`:
  - Brak talii o podanym `deckId` (lub została soft-usunięta).
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/decks/[deckId].ts` odbiera `deckId` ze ścieżki.
2. Walidacja `deckId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` (zgodnie z zasadami backend).
4. Zapytanie do tabeli `decks`:
   - Filtry: `id = deckId`, `deleted_at IS NULL`, `user_id = <system_user_id/anon_id>`.
5. Jeśli nie znaleziono rekordu → `404`.
6. Mapowanie do `DeckDetailsDTO` i zwrot `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`, aby zachować spójność z RLS i przyszłą autoryzacją.
- `deckId` musi być walidowany, aby zapobiec błędom SQL i nadużyciom.
- Brak danych wrażliwych w odpowiedzi, ale używać minimalnego zestawu pól (DTO).

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `deckId`.
- `404 NotFound`: brak talii lub `deleted_at` ustawiony.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera (np. `console.error`) z kontekstem `deckId` i `user_id`. Brak dedykowanej tabeli błędów w schemacie.

## 7. Wydajność
- Zapytanie po PK `id` + filtr `user_id` i `deleted_at` jest szybkie (PK/indeksy).
- Zwraca tylko niezbędne pola (minimalizacja transferu).

## 8. Kroki implementacji
1. Utworzyć plik endpointu `src/pages/api/decks/[deckId].ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `deckId` (UUID).
3. W `GET` pobrać `supabase` z `context.locals` oraz `user_id` (stały lub z cookie anon).
4. Wykonać zapytanie do `decks` z filtrami `id`, `user_id`, `deleted_at IS NULL`.
5. Obsłużyć brak rekordu (`404`) i błędy Supabase (`500`).
6. Zmapować wynik do `GetDeckResponseDTO` i zwrócić `200`.
7. Dodać testy integracyjne (jeśli istnieje infrastruktura testowa) dla scenariuszy: sukces, niepoprawny UUID, brak rekordu.
