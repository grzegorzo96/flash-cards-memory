# Plan implementacji widoku Szczegoly talii (lista fiszek)

## 1. Przeglad
Widok pokazuje liste fiszek w talii, umożliwia wyszukiwanie, paginacje i szybkie akcje na kartach.

## 2. Routing widoku
- Sciezka: `/decks/:deckId`

## 3. Struktura komponentow
- `DeckDetailsPage`
- `DeckDetailsHeader`
- `FlashcardsSearch`
- `FlashcardsList`
- `FlashcardRow`
- `Pagination`
- `SidePreviewPanel` (opcjonalnie)
- `EmptyState`
- `ErrorBanner`
- `DeleteFlashcardDialog`

## 4. Szczegoly komponentow
### DeckDetailsPage
- Opis: Strona z pobraniem danych talii i listy fiszek.
- Typy: `GetDeckResponseDTO`, `FlashcardListResponseDTO`.

### DeckDetailsHeader
- Opis: Nazwa talii, licznik kart, CTA "Dodaj fiszke".
- Interakcje: przejscie do `/flashcards/new?deckId=...`.

### FlashcardsSearch
- Opis: Pole wyszukiwania `q`.
- Walidacja: brak (pusty string = brak filtra).

### FlashcardsList / FlashcardRow
- Opis: Lista kart z akcjami.
- Interakcje: `open`, `edit`, `delete`.
- Typy: `FlashcardListItemDTO`.

### SidePreviewPanel
- Opis: Szybki podglad pytania/odpowiedzi.

### DeleteFlashcardDialog
- Opis: Potwierdzenie usuniecia.

## 5. Typy
- `GetDeckResponseDTO` (`id`, `name`, `description`).
- `FlashcardListQueryDTO` (`limit`, `offset`, `sort`, `order`, `q`).
- `FlashcardListResponseDTO` (`items`, `limit`, `offset`, `total`).
- `FlashcardListItemDTO` (pytanie, answer, daty, source, etc.).
- `DeleteResponseDTO`.

## 6. Zarzadzanie stanem
- `deck`, `query`, `data`, `isLoading`, `error`.
- `useDeckDetails(deckId)` i `useDeckFlashcards(deckId, query)`.

## 7. Integracja API
- `GET /api/decks/{deckId}`.
- `GET /api/decks/{deckId}/flashcards`.
- `DELETE /api/flashcards/{flashcardId}`.

## 8. Interakcje uzytkownika
- Wyszukiwanie w czasie rzeczywistym.
- Edycja lub podglad fiszki.
- Usuniecie z potwierdzeniem.
- Dodanie nowej fiszki.

## 9. Warunki i walidacja
- Walidacja `deckId` jako UUID (po stronie routingu).
- Potwierdzenie usuniecia fiszki.

## 10. Obsluga bledow
- 404 deck -> komunikat i powrot do `/decks`.
- Blad listy -> `ErrorBanner`.
- Brak wynikow -> `EmptyState`.

## 11. Kroki implementacji
1. Dodaj strone `/decks/:deckId`.
2. Pobierz szczegoly talii i liste fiszek.
3. Dodaj wyszukiwanie i paginacje.
4. Dodaj akcje edit/delete oraz szybki podglad.
5. Dodaj stany empty/error.
