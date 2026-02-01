# API Endpoint Implementation Plan: POST /api/decks

## 1. Przegląd punktu końcowego
Punkt końcowy tworzy nową talię (deck) na podstawie przesłanych danych. W MVP brak autoryzacji, ale rekord musi być przypisany do stałego/anonimowego `user_id` zgodnie ze schematem bazy.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/decks`
- Parametry:
  - Wymagane: brak w query/path
  - Opcjonalne: brak w query/path
- Request Body:
  ```json
  { "name": "Biology", "description": "Cell biology" }
  ```
- Typy:
  - `CreateDeckCommand`
  - `CreateDeckResponseDTO` / `DeckDetailsDTO`
  - `Deck` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `201 Created`:
  - Body:
    ```json
    { "id": "uuid", "name": "Biology", "description": "Cell biology" }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. `name` < 3 znaki).
- `409 Conflict`:
  - `name` już istnieje dla danego `user_id` (naruszenie UNIQUE).
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/decks/index.ts` odbiera JSON body.
2. Walidacja body Zod:
   - `name` wymagane, min. 3 znaki.
   - `description` opcjonalne (string lub null).
3. Pobranie `supabase` z `context.locals` oraz `user_id` (stały lub z cookie anon).
4. Wywołanie logiki serwisowej (np. `src/lib/services/decks/createDeck`) tworzącej rekord w `decks`.
5. Obsługa konfliktu unikalności (`user_id`, `name`) → `409`.
6. Zwrócenie `CreateDeckResponseDTO` i statusu `201`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal ustawiamy `user_id`, aby utrzymać spójność z RLS i przyszłą autoryzacją.
- Walidacja danych wejściowych (Zod) chroni przed błędnymi danymi i nadużyciami.
- Nie zwracamy pól wrażliwych; tylko DTO z minimalnym zestawem pól.

## 6. Obsługa błędów
- `400 ValidationError`: brak `name` lub zbyt krótka wartość.
- `409 DeckNameExists`: naruszenie unikalności `user_id` + `name`.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `user_id` i `name`. Brak dedykowanej tabeli błędów w schemacie.

## 7. Wydajność
- Jedno zapytanie INSERT z indeksowaną unikalnością.
- Zwracamy tylko pola wymagane przez DTO.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/decks/index.ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `CreateDeckCommand`.
3. W `POST` pobrać `supabase` z `context.locals` oraz `user_id`.
4. Wyodrębnić logikę tworzenia talii do serwisu `src/lib/services/decks`.
5. Obsłużyć konflikt unikalności i mapować na `409`.
6. Zwrócić `CreateDeckResponseDTO` z `201`.
7. Dodać testy integracyjne: sukces, niepoprawne dane, konflikt nazwy.
