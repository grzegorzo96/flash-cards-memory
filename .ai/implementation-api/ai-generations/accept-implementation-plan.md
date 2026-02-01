# API Endpoint Implementation Plan: POST /api/generation-requests/{requestId}/accept

## 1. Przegląd punktu końcowego
Punkt końcowy zapisuje zaakceptowane karty z podglądu AI do bazy danych jako fiszki. W MVP brak autoryzacji, ale operacja musi być ograniczona do stałego/anonimowego `user_id` i wskazanego `deck_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/generation-requests/{requestId}/accept`
- Parametry:
  - Wymagane: `requestId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "deck_id": "uuid",
    "cards": [
      {
        "question": "Q1",
        "answer": "A1",
        "original_question": "AI Q1",
        "original_answer": "AI A1",
        "source": "ai",
        "is_accepted": true,
        "source_language": "en",
        "target_language": "en"
      }
    ]
  }
  ```
- Typy:
  - `AcceptGeneratedCardsCommand`
  - `AcceptedCardInputDTO`
  - `AcceptGeneratedCardsResponseDTO`
  - `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `201 Created`:
  - Body:
    ```json
    { "saved_count": 12, "flashcard_ids": ["uuid"] }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. pusta lista `cards`, zły format pól).
- `404 Not Found`:
  - Brak żądania `requestId` lub brak talii `deck_id`.
- `500 Internal Server Error`:
  - Błąd zapisu w bazie lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/generation-requests/[requestId]/accept.ts` odbiera `requestId` i JSON body.
2. Walidacja `requestId` jako UUID (Zod).
3. Walidacja body Zod:
   - `deck_id` wymagane (UUID).
   - `cards` wymagane, min. 1 element.
   - Każda karta: `question`/`answer` 1–2000, `source`=`ai`, `is_accepted`=true, języki `pl|en`.
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Weryfikacja istnienia `generation_requests` (id + user_id).
6. Weryfikacja istnienia talii `decks` (id + user_id + `deleted_at IS NULL`).
7. Insert batch do `flashcards` z `generation_request_id=requestId`, `deck_id`, `user_id`.
8. Zwrócenie `AcceptGeneratedCardsResponseDTO` z `201`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja wejścia i limit rozmiaru batcha (np. max 100 kart).
- Nie przyjmować kart z `source` innym niż `ai`.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe lub pusta lista.
- `404 NotFound`: brak requesta lub talii.
- `500 ServerError`: błędy Supabase, przekroczenia limitów, itp.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `requestId`, `deck_id`, `user_id`.

## 7. Wydajność
- Wstawianie batchowe do `flashcards`.
- Walidacja ogranicza liczbę kart w jednej operacji.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/generation-requests/[requestId]/accept.ts` z `export const prerender = false`.
2. Zdefiniować schematy Zod dla `requestId` i `AcceptGeneratedCardsCommand`.
3. Wyodrębnić logikę do serwisu `src/lib/services/ai-generations` (np. `acceptGeneratedCards`).
4. Zaimplementować weryfikację `generation_requests` i `decks`.
5. Wstawić karty batchowo do `flashcards`.
6. Zwrócić `AcceptGeneratedCardsResponseDTO` z `201`.
7. Dodać testy integracyjne: sukces, pusta lista, brak requesta, brak talii.
