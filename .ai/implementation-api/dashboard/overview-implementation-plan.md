# API Endpoint Implementation Plan: GET /api/dashboard

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca zagregowane dane do dashboardu: liczbę kart do powtórki dziś oraz listę talii z licznikami kart. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id` i pomijać rekordy z `deleted_at`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/dashboard`
- Parametry:
  - Wymagane: brak
  - Opcjonalne: brak
- Request Body: brak
- Typy:
  - `DashboardResponseDTO`
  - `DashboardDeckDTO`
  - `Deck` / `Flashcard` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    {
      "due_today_total": 25,
      "decks": [
        { "id": "uuid", "name": "Biology", "card_count": 120, "due_today_count": 15 }
      ]
    }
    ```
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/dashboard.ts` obsługuje żądanie.
2. Pobranie `supabase` z `context.locals` oraz `user_id`.
3. Agregacja per talia:
   - `card_count`: liczba aktywnych fiszek w talii (`deleted_at IS NULL`).
   - `due_today_count`: liczba fiszek z `next_due_at` <= dziś.
4. Wyliczenie `due_today_total` jako suma `due_today_count`.
5. Zwrócenie `DashboardResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id`.
- Nie zwracać danych z rekordów soft-usuniętych.
- Brak ujawniania danych spoza DTO.

## 6. Obsługa błędów
- `500 ServerError`: błędy Supabase lub agregacji.
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `user_id`.

## 7. Wydajność
- Agregacje powinny być zoptymalizowane indeksami (`deck_id`, `next_due_at`).
- Rozważyć RPC/SQL view przy rosnącej skali.

## 8. Kroki implementacji
1. Utworzyć endpoint `src/pages/api/dashboard.ts` z `export const prerender = false`.
2. Wyodrębnić logikę do serwisu `src/lib/services/dashboard` (np. `getDashboardOverview`).
3. Zaimplementować agregacje per talia oraz sumę `due_today_total`.
4. Zwrócić `DashboardResponseDTO` z `200`.
5. Dodać testy integracyjne: sukces, brak talii, brak kart.
