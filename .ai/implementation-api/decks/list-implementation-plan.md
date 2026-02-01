# API Endpoint Implementation Plan: GET /api/decks

## 1. Przegląd punktu końcowego
Punkt końcowy zwraca listę talii (decks) wraz z paginacją i opcjonalnymi licznikami kart. W MVP brak autoryzacji, ale dane muszą być filtrowane po stałym/anonimowym `user_id` oraz pomijać rekordy z `deleted_at`.

## 2. Szczegóły żądania
- Metoda HTTP: `GET`
- Struktura URL: `/api/decks`
- Parametry:
  - Wymagane: brak
  - Opcjonalne:
    - `limit` (number)
    - `offset` (number)
    - `sort` (`name|created_at|due_count`)
    - `order` (`asc|desc`)
    - `include_counts` (`true|false`)
- Request Body: brak
- Typy:
  - `DeckListQueryDTO`
  - `DeckListResponseDTO`, `DeckListItemDTO`
  - `Deck` (do mapowania pól z DB)

## 3. Szczegóły odpowiedzi
- `200 OK`:
  - Body:
    ```json
    {
      "items": [
        {
          "id": "uuid",
          "name": "Biology",
          "description": "Cell biology",
          "created_at": "ts",
          "updated_at": "ts",
          "card_count": 120,
          "due_today_count": 15
        }
      ],
      "limit": 20,
      "offset": 0,
      "total": 4
    }
    ```
- `400 Bad Request`:
  - Nieprawidłowe parametry (np. ujemny `limit`, nieznane `sort`).
- `500 Internal Server Error`:
  - Błąd zapytania do bazy lub nieoczekiwany wyjątek.

## 4. Przepływ danych
1. Handler `GET` w `src/pages/api/decks/index.ts` odbiera query params.
2. Walidacja query params (Zod):
   - `limit` i `offset` jako liczby nieujemne.
   - `sort` tylko z dozwolonego zestawu.
   - `order` tylko `asc|desc`.
   - `include_counts` jako boolean.
3. Pobranie `supabase` z `context.locals` oraz `user_id`.
4. Zbudowanie zapytania do `decks`:
   - Filtry: `user_id = <system_user_id/anon_id>`, `deleted_at IS NULL`.
   - Sortowanie: wg `sort` i `order` (domyślne wartości ustalić w implementacji, np. `created_at desc`).
   - Paginacja: `limit`, `offset`.
5. Jeśli `include_counts=true`, dołączenie agregacji:
   - `card_count`: liczba aktywnych `flashcards` w talii.
   - `due_today_count`: liczba `flashcards` z `next_due_at` <= dziś.
6. Zwrócenie `DeckListResponseDTO` z `200`.

## 5. Względy bezpieczeństwa
- MVP bez autoryzacji, ale nadal filtrujemy po `user_id` dla spójności z RLS i przyszłą autoryzacją.
- Walidacja parametrów wejściowych ogranicza nadużycia (np. ekstremalne `limit`).
- Nie zwracać danych z rekordów soft-usuniętych.

## 6. Obsługa błędów
- `400 ValidationError`: nieprawidłowe parametry query.
- `500 ServerError`: błędy Supabase (timeout, błędna konfiguracja, itp.).
- Logowanie: zapisywać szczegóły błędów w logach serwera z kontekstem `user_id` i parametrami.

## 7. Wydajność
- Indeksy wspierają filtrowanie po `user_id` oraz sortowanie po `created_at`.
- Liczniki kart mogą być kosztowne; wykonywać je tylko przy `include_counts=true`.
- Rozważyć limit maksymalny dla `limit` (np. 50/100) w walidacji.

## 8. Kroki implementacji
1. Dodać handler `GET` w `src/pages/api/decks/index.ts` z `export const prerender = false` (jeśli nie istnieje).
2. Zdefiniować schemat Zod dla `DeckListQueryDTO`.
3. Wyodrębnić logikę pobierania listy do serwisu `src/lib/services/decks` (np. `listDecks`).
4. Zaimplementować paginację i sortowanie zgodnie z parametrami.
5. Dodać opcjonalne agregacje `card_count` i `due_today_count`.
6. Zwrócić `DeckListResponseDTO` z `200`.
7. Dodać testy integracyjne: domyślne wartości, walidacja query, sortowanie, `include_counts`.
