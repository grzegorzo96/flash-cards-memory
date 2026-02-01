# Plan implementacji widoku Lista talii

## 1. Przeglad
Widok listy talii umozliwia przeglad, sortowanie i podstawowe operacje na taliach oraz szybkie rozpoczecie nauki.

## 2. Routing widoku
- Sciezka: `/decks`

## 3. Struktura komponentow
- `DecksListPage`
- `DecksListHeader`
- `DecksTable`
- `DeckRow`
- `DecksFilters`
- `Pagination`
- `EmptyState`
- `DeleteDeckDialog`
- `ErrorBanner`

## 4. Szczegoly komponentow
### DecksListPage
- Opis: Strona z pobraniem listy i sterowaniem sort/pagination.
- Interakcje: delegacja.
- Typy: `DeckListResponseDTO`, `DeckListQueryDTO`.

### DecksListHeader
- Opis: Tytul + CTA "Utworz talie".
- Interakcje: nawigacja do `/decks/new`.

### DecksFilters
- Opis: Sortowanie i kolejnosc.
- Interakcje: `onSortChange`, `onOrderChange`.
- Walidacja: tylko `name|created_at|due_count`.

### DecksTable / DeckRow
- Opis: Lista/tabela talii z akcjami.
- Interakcje: `onOpen`, `onEdit`, `onDelete`, `onStartStudy`.
- Typy: `DeckListItemDTO`.

### DeleteDeckDialog
- Opis: Potwierdzenie usuniecia.
- Walidacja: wymagane potwierdzenie (np. wpisanie nazwy).

### Pagination
- Opis: Sterowanie `limit/offset`.

## 5. Typy
- `DeckListQueryDTO` (`limit`, `offset`, `sort`, `order`, `include_counts`).
- `DeckListResponseDTO` (`items`, `limit`, `offset`, `total`).
- `DeckListItemDTO` (`id`, `name`, `description`, `card_count`, `due_today_count`).
- `DeleteResponseDTO` (`ok: true`).

## 6. Zarzadzanie stanem
- `query`, `data`, `isLoading`, `error`.
- `useDecksList(query)` do pobierania i odswiezania.

## 7. Integracja API
- `GET /api/decks?include_counts=true`.
- `DELETE /api/decks/{deckId}`.
- `POST /api/study-sessions` przy starcie nauki.

## 8. Interakcje uzytkownika
- Sortowanie listy.
- Przejscie do szczegolow talii.
- Edycja talii.
- Usuniecie z potwierdzeniem.
- Rozpoczecie sesji nauki.

## 9. Warunki i walidacja
- Walidacja sort/order.
- Potwierdzenie usuniecia przed wykonaniem DELETE.

## 10. Obsluga bledow
- Brak listy -> `EmptyState`.
- Blad DELETE -> komunikat, brak usuniecia z UI.
- Blad sieci -> `ErrorBanner`.

## 11. Kroki implementacji
1. Zbuduj strone `/decks` i `useDecksList`.
2. Dodaj sortowanie i paginacje.
3. Dodaj akcje `open/edit/delete/start`.
4. Dodaj `DeleteDeckDialog`.
5. Dodaj stany loading/empty/error.
