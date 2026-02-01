# Plan implementacji widoku Fiszka szczegoly

## 1. Przeglad
Widok pojedynczej fiszki umozliwia podglad, edycje pytania i odpowiedzi oraz usuniecie.

## 2. Routing widoku
- Sciezka: `/flashcards/:flashcardId`

## 3. Struktura komponentow
- `FlashcardDetailsPage`
- `FlashcardHeader`
- `FlashcardForm`
- `MarkdownToolbar`
- `ActionBar`
- `DeleteFlashcardDialog`
- `ErrorBanner`

## 4. Szczegoly komponentow
### FlashcardDetailsPage
- Opis: Pobiera dane fiszki, renderuje formularz.
- Typy: `GetFlashcardResponseDTO`, `UpdateFlashcardCommand`.

### FlashcardForm
- Opis: Edycja `question` i `answer` z formatowaniem.
- Interakcje: `submit`, `cancel`.
- Walidacja: 1-2000 znakow dla obu pol.

### MarkdownToolbar
- Opis: Przyciski bold/italic.

### ActionBar
- Opis: `Zapisz`, `Anuluj`, `Usun`.

### DeleteFlashcardDialog
- Opis: Potwierdzenie usuniecia.

## 5. Typy
- `GetFlashcardResponseDTO` (`id`, `question`, `answer`, `deck_id`).
- `UpdateFlashcardCommand` (`question?`, `answer?`).
- `UpdateFlashcardResponseDTO` (`id`, `updated_at`).
- `DeleteResponseDTO`.

## 6. Zarzadzanie stanem
- `flashcard`, `form`, `errors`, `isSubmitting`, `error`.
- `useFlashcardDetails(flashcardId)`.

## 7. Integracja API
- `GET /api/flashcards/{flashcardId}`.
- `PATCH /api/flashcards/{flashcardId}`.
- `DELETE /api/flashcards/{flashcardId}`.

## 8. Interakcje uzytkownika
- Edycja tekstu z toolbar.
- Zapis -> powrot do `/decks/:deckId`.
- Usuniecie -> powrot do `/decks/:deckId`.

## 9. Warunki i walidacja
- `question` i `answer` wymagane, 1-2000 znakow.
- Blokada zapisu przy bledach.

## 10. Obsluga bledow
- 404 -> komunikat i powrot.
- 400 walidacja -> blad przy polu.
- 500 -> `ErrorBanner`.

## 11. Kroki implementacji
1. Dodaj strone `/flashcards/:flashcardId`.
2. Pobierz dane i zasil formularz.
3. Dodaj toolbar Markdown i walidacje.
4. Podlacz PATCH/DELETE i przekierowania.
