# Plan implementacji widoku Formularz talii

## 1. Przeglad
Widok tworzenia/edycji talii z walidacja nazwy i opcjonalnym opisem.

## 2. Routing widoku
- `/decks/new`
- `/decks/:deckId/edit`

## 3. Struktura komponentow
- `DeckFormPage`
- `DeckForm`
- `FormField`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### DeckFormPage
- Opis: Strona, pobiera dane talii w trybie edycji.
- Typy: `GetDeckResponseDTO`, `CreateDeckCommand`, `UpdateDeckCommand`.

### DeckForm
- Opis: Formularz z polami `name`, `description`.
- Interakcje: `submit`, `cancel`.
- Walidacja: `name` min 3 znaki; unikalnosc (409).

### ActionBar
- Opis: Przyciski zapisu/anulowania.

## 5. Typy
- `CreateDeckCommand` (`name`, `description`).
- `UpdateDeckCommand` (partial `name`, `description`).
- `CreateDeckResponseDTO` / `UpdateDeckResponseDTO`.

## 6. Zarzadzanie stanem
- `form`, `errors`, `isSubmitting`, `mode` (create/edit).
- `useDeckForm(deckId?)` do pobierania i submitu.

## 7. Integracja API
- Create: `POST /api/decks`.
- Edit: `GET /api/decks/{deckId}`, `PATCH /api/decks/{deckId}`.

## 8. Interakcje uzytkownika
- Wpisanie nazwy i opisu.
- Zapis i przekierowanie do `/decks/:deckId` lub `/decks`.
- Anulowanie -> powrot.

## 9. Warunki i walidacja
- `name` wymagane, min 3 znaki.
- Blokada przycisku zapisu przy bledach.

## 10. Obsluga bledow
- 409 `DeckNameExists` -> blad przy polu.
- 404 w edycji -> komunikat i powrot.
- Blad sieci -> `ErrorBanner`.

## 11. Kroki implementacji
1. Dodaj strony `/decks/new` i `/decks/:deckId/edit`.
2. Zaimplementuj `DeckForm` z walidacja.
3. Podlacz API create/update.
4. Dodaj stany bledow i przekierowania.
