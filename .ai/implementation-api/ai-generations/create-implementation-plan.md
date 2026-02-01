# API Endpoint Implementation Plan: POST /api/generation-requests

## 1. Przegląd punktu końcowego
Punkt końcowy inicjuje proces generowania fiszek przez AI. Zapisuje żądanie w `generation_requests` i zwraca status `processing` wraz z wykrytym językiem źródłowym. W MVP brak autoryzacji, ale rekord musi być przypisany do stałego/anonimowego `user_id`. Endpoint powinien być objęty ograniczeniem rate limit.

## 2. Szczegóły żądania
- Metoda HTTP: `POST`
- Struktura URL: `/api/generation-requests`
- Parametry:
  - Wymagane: brak w query/path
  - Opcjonalne: brak w query/path
- Request Body:
  ```json
  {
    "deck_id": "uuid-or-null",
    "source_text": "text up to 5000 chars",
    "domain": "Medicine",
    "target_language": "en",
    "instructions": "optional feedback for regeneration"
  }
  ```
- Typy:
  - `GenerationRequestCreateCommand`
  - `GenerationRequestCreateResponseDTO`
  - `GenerationRequest` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `202 Accepted`:
  - Body:
    ```json
    {
      "id": "uuid",
      "status": "processing",
      "detected_source_language": "en"
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowe dane wejściowe (np. `source_text` poza 1–5000, brak `domain`).
- `429 Too Many Requests`:
  - Przekroczony limit zapytań do generacji.
- `500 Internal Server Error`:
  - Błąd zapisu lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `POST` w `src/pages/api/generation-requests/index.ts` odbiera JSON body.
2. Walidacja body Zod:
   - `source_text` wymagane, 1–5000 znaków.
   - `domain` wymagane (zgodne z listą w UI).
   - `target_language` wymagane (`pl|en`).
   - `deck_id` opcjonalne (UUID lub null).
   - `instructions` opcjonalne (string).
3. Sprawdzenie rate limit (np. 5/min na instancję).
4. Pobranie `supabase` z `context.locals` oraz `user_id`.
5. Wykrycie `source_language` (np. prosty detektor języka lub wynik z AI; w MVP może być heurystyka).
6. Insert do `generation_requests` ze statusem `processing` (lub `pending` → `processing`).
7. Wywołanie usługi AI (Openrouter.ai) asynchronicznie i zapis wyników do pamięci/tymczasowego magazynu dla preview.
8. Zwrócenie `GenerationRequestCreateResponseDTO` z `202`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal ustawiamy `user_id` dla spójności z RLS.
- Walidacja wejścia zapobiega nadużyciom oraz kosztownym wywołaniom AI.
- Rate limit chroni przed przeciążeniem i kosztami.
- Nie ujawniać danych wrażliwych w odpowiedzi.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe dane wejściowe.
- `429 TooManyRequests`: przekroczony limit.
- `500 ServerError`: błędy Supabase, timeouty AI, problemy z usługą zewnętrzną.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `user_id`, `deck_id` i długością `source_text`.

## 7. Wydajność
- Ograniczenie długości `source_text` do 5000 znaków.
- Asynchroniczna obsługa AI i szybka odpowiedź `202`.
- Rate limit po stronie API.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/generation-requests/index.ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `GenerationRequestCreateCommand`.
3. Dodać middleware/rate limiter dla endpointu.
4. Wyodrębnić logikę do serwisu `src/lib/services/ai-generations` (np. `createGenerationRequest`).
5. Zaimplementować zapis w `generation_requests` i inicjację procesu AI.
6. Zwrócić `GenerationRequestCreateResponseDTO` z `202`.
7. Dodać testy integracyjne: walidacja, rate limit, poprawne tworzenie rekordu.
