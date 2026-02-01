# API Endpoint Implementation Plan: POST /api/decks/{deckId}/flashcards

## 1. Przegląd punktu końcowego
Punkt końcowy tworzy fiszkę manualną w danej talii. W MVP brak autoryzacji, ale zapis musi być przypisany do stałego/anonimowego `user_id` i powiązany z `deck_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/decks/{deckId}/flashcards`
- Parametry:
  - Wymagane: `deckId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "question": "What is a cell?",
    "answer": "The basic unit of life.",
    "source_language": "en",
    "target_language": "en"
  }
  ```
- Typy:
  - `CreateFlashcardCommand`
  - `CreateFlashcardResponseDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `201 Created`:
  - Body:
    ```json
    { "id": "uuid", "source": "manual", "is_accepted": true }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. brak `question`/`answer`, długość > 2000).
- `404 Not Found`:
  - Brak talii o podanym `deckId`.
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/decks/[deckId]/flashcards.ts` odbiera `deckId` i JSON body.
2. Walidacja `deckId` jako UUID (Zod).
3. Walidacja body Zod:
   - `question` i `answer` wymagane, 1–2000 znaków.
   - `source_language` i `target_language` wymagane (`pl|en`).
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Weryfikacja istnienia talii (`decks`) z filtrami `id`, `user_id`, `deleted_at IS NULL`.
6. Jeśli brak talii → `404`.
7. Insert do `flashcards`:
   - `deck_id = deckId`
   - `source = 'manual'`
   - `is_accepted = true`
   - `user_id = <system_user_id/anon_id>`
8. Zwrócenie `CreateFlashcardResponseDTO` z `201`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS.
- Walidacja wejścia zapobiega błędom i nadużyciom.
- Brak ujawniania pól spoza DTO.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe lub `deckId`.
- `404 DeckNotFound`: brak talii.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `deckId`, `user_id` i payloadem.

## 7. Wydajność
- Jedno zapytanie INSERT; indeks `deck_id` wspiera szybkie powiązania.
- Minimalny response payload.

## 8. Kroki implementacji
1. Dodać handler `POST` w `src/pages/api/decks/[deckId]/flashcards.ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schematy Zod dla `deckId` i `CreateFlashcardCommand`.
3. Wyodrębnić logikę tworzenia fiszki do serwisu `src/lib/services/flashcards` (np. `createFlashcard`).
4. Zaimplementować weryfikację istnienia talii i filtr `deleted_at IS NULL`.
5. Zwrócić `CreateFlashcardResponseDTO` z `201`.
6. Dodać testy integracyjne: sukces, walidacja danych, brak talii.
