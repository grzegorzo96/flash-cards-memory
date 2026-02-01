# API Endpoint Implementation Plan: GET /api/generation-requests/{requestId}

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca status generacji oraz podgląd wygenerowanych kart (preview). W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/generation-requests/{requestId}`
- Parametry:
  - Wymagane: `requestId` (UUID w ścieżce)
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `GenerationRequestStatusResponseDTO`
  - `PreviewCardDTO`
  - `GenerationRequest` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    {
      "id": "uuid",
      "status": "completed",
      "error_code": null,
      "error_message": null,
      "preview_cards": [
        { "question": "...", "answer": "...", "source": "ai" }
      ]
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowy format `requestId`.
- `404 Not Found`:
  - Brak żądania o podanym `requestId`.
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/generation-requests/[requestId].ts` odbiera `requestId`.
2. Walidacja `requestId` jako UUID (Zod).
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Pobranie rekordu z `generation_requests` z filtrami `id` i `user_id`.
5. Jeśli brak rekordu → `404`.
6. Pobranie podglądu `preview_cards` z magazynu tymczasowego (np. pamięć/redis/kv) lub z usługi AI (jeśli przechowywane po stronie backendu).
7. Zwrócenie `GenerationRequestStatusResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Walidacja UUID zapobiega błędom zapytań i nadużyciom.
- Nie ujawniać surowego `source_text` ani danych wrażliwych.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowy `requestId`.
- `404 NotFound`: brak żądania.
- `500 ServerError`: błędy Supabase lub magazynu preview.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `requestId` i `user_id`.

## 7. Wydajność
- Odczyt po PK `id`.
- Preview z cache/magazynu tymczasowego, aby uniknąć ponownych wywołań AI.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/generation-requests/[requestId].ts` z `export const prerender = false`.
2. Zdefiniować schemat Zod dla `requestId`.
3. Wyodrębnić logikę do serwisu `src/lib/services/ai-generations` (np. `getGenerationStatus`).
4. Zaimplementować pobieranie `preview_cards` z magazynu tymczasowego.
5. Zwrócić `GenerationRequestStatusResponseDTO` z `200`.
6. Dodać testy integracyjne: sukces, niepoprawny UUID, brak rekordu.
