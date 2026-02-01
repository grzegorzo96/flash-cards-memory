# Plan implementacji widoku Nowa fiszka

## 1. Przeglad
Widok umozliwia reczne utworzenie fiszki i przypisanie do talii.

## 2. Routing widoku
- Sciezka: `/flashcards/new` (opcjonalny query `deckId`)

## 3. Struktura komponentow
- `FlashcardCreatePage`
- `FlashcardForm`
- `DeckSelector`
- `MarkdownToolbar`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### FlashcardCreatePage
- Opis: Strona z formularzem tworzenia.
- Typy: `CreateFlashcardCommand`, `CreateFlashcardResponseDTO`.

### FlashcardForm
- Opis: Pola pytania i odpowiedzi.
- Walidacja: 1-2000 znakow.

### DeckSelector
- Opis: Wybierak talii.
- Walidacja: `deck_id` wymagane przed zapisem.

## 5. Typy
- `CreateFlashcardCommand` (`question`, `answer`, `source_language`, `target_language`).
- `CreateFlashcardResponseDTO` (`id`, `source`, `is_accepted`).
- `DeckListResponseDTO` / `DeckListItemDTO`.

## 6. Zarzadzanie stanem
- `form`, `deckId`, `errors`, `isSubmitting`.
- `useDecks()` do pobierania listy talii.

## 7. Integracja API
- `GET /api/decks?include_counts=false` (dropdown).
- `POST /api/decks/{deckId}/flashcards`.

## 8. Interakcje uzytkownika
- Wpisanie pytania/odpowiedzi.
- Wybieranie talii.
- Zapis -> przekierowanie do `/decks/:deckId`.

## 9. Warunki i walidacja
- `deck_id` wymagane.
- `question` i `answer` 1-2000 znakow.
- `source_language` i `target_language` `pl|en`.

## 10. Obsluga bledow
- 400 walidacja -> bledy przy polach.
- 404 deck -> komunikat i powrot.
- Blad sieci -> `ErrorBanner`.

## 11. Kroki implementacji
1. Dodaj strone `/flashcards/new`.
2. Dodaj formularz z walidacja.
3. Podlacz API tworzenia fiszki.
4. Dodaj przekierowanie po sukcesie.
