# API Endpoint Implementation Plan: PATCH /api/decks/{deckId}

## 1. Przegląd punktu końcowego
Punkt końcowy aktualizuje nazwę i/lub opis istniejącej talii. W MVP brak autoryzacji, ale aktualizacja musi być ograniczona do stałego/anonimowego `user_id`. Talia soft-usunięta nie powinna być edytowalna.

## 2. Szczegóły żądania
- Metoda HTTP: `PATCH`
- Struktura URL: `/api/decks/{deckId}`
- Parametry:
  - Wymagane: `deckId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  { "name": "Biology 101", "description": "Basics" }
  ```
- Typy:
  - `UpdateDeckCommand`
  - `UpdateDeckResponseDTO` / `DeckDetailsDTO`
  - `Deck` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    { "id": "uuid", "name": "Biology 101", "description": "Basics" }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. `name` < 3 znaki lub puste body).
- `404 Not Found`:
  - Brak talii o podanym `deckId` (lub została soft-usunięta).
- `409 Conflict`:
  - `name` już istnieje dla danego `user_id` (naruszenie UNIQUE).
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `PATCH` w `src/pages/api/decks/[deckId].ts` odbiera `deckId` i JSON body.
2. Walidacja `deckId` jako UUID (Zod).
3. Walidacja body Zod:
   - `name` opcjonalne, min. 3 znaki.
   - `description` opcjonalne.
   - Wymagane co najmniej jedno z pól.
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Pobranie talii z `decks` z filtrami `id`, `user_id`, `deleted_at IS NULL`.
6. Jeśli brak rekordu → `404`.
7. Aktualizacja rekordów i ustawienie `updated_at`.
8. Obsługa konfliktu unikalności (`user_id`, `name`) → `409`.
9. Zwrócenie `UpdateDeckResponseDTO` i statusu `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Brak ujawniania pól spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `deckId`, niepoprawne dane lub puste body.
- `404 NotFound`: brak talii lub `deleted_at` ustawiony.
- `409 DeckNameExists`: naruszenie unikalności `user_id` + `name`.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `deckId`, `user_id` i payloadem.

## 7. Wydajność
- Jedno pobranie rekordu + jedno zapytanie UPDATE.
- Indeksy wspierają filtrowanie po `user_id` i `id`.

## 8. Kroki implementacji
1. Dodać handler `PATCH` w `src/pages/api/decks/[deckId].ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schematy Zod dla `deckId` i `UpdateDeckCommand` (wymagane min. jedno pole).
3. Wyodrębnić logikę aktualizacji do serwisu `src/lib/services/decks` (np. `updateDeck`).
4. Zaimplementować pobranie rekordu i weryfikację `deleted_at`.
5. Obsłużyć konflikt unikalności i mapować na `409`.
6. Zwrócić `UpdateDeckResponseDTO` z `200`.
7. Dodać testy integracyjne: sukces, puste body, konflikt nazwy, brak rekordu.
