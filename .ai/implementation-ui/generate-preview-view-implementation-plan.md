# Plan implementacji widoku Generowanie - podglad fiszek

## 1. Przeglad
Widok `/generate/preview` sluzy do weryfikacji, edycji, usuwania i akceptacji fiszek wygenerowanych przez AI przed zapisem do wybranej talii. Umozliwia takze regeneracje z instrukcjami, dodanie fiszki manualnej oraz zapis zestawu do backendu.

## 2. Routing widoku
- Sciezka: `/generate/preview`
- Oczekiwany parametr: `requestId` (np. query string `?requestId=uuid`)
- Zachowanie awaryjne: brak `requestId` -> przekierowanie do `/generate/input`

## 3. Struktura komponentow
- `GeneratePreviewPage` (strona Astro + React root)
- `GenerationPreviewShell`
- `PreviewHeader`
- `GenerationMetaPanel`
- `DeckSelector`
- `InlineCreateDeckForm`
- `PreviewCardsList`
- `PreviewCardItem`
- `PreviewCardEditor` (inline lub modal)
- `AddManualCardForm`
- `RegenerationPanel`
- `ActionBar`
- `ErrorBanner`
- `LoadingState`
- `EmptyState`

## 4. Szczegoly komponentow
### GeneratePreviewPage
- Opis komponentu: Strona widoku z pobieraniem danych i orchestration stanu.
- Glowne elementy: kontener strony, root dla React (np. `FlashcardApp` lub nowy root).
- Obslugiwane interakcje: brak bezposrednich.
- Obslugiwana walidacja: brak.
- Typy: `GenerationRequestStatusResponseDTO`, `DeckListResponseDTO`.
- Propsy: brak.

### GenerationPreviewShell
- Opis komponentu: Layout widoku, spina naglowek, panel talii, liste i akcje.
- Glowne elementy: `main`, sekcje z `PreviewHeader`, `GenerationMetaPanel`, `PreviewCardsList`, `ActionBar`.
- Obslugiwane interakcje: przekazuje handlery do dzieci.
- Obslugiwana walidacja: brak.
- Typy: `GenerationPreviewViewModel`.
- Propsy: `vm`, `onSave`, `onRegenerate`, `onBack`, `onCancel`.

### PreviewHeader
- Opis komponentu: Naglowek z nazwa kroku i licznikiem fiszek.
- Glowne elementy: `h1`, licznik, opcjonalny opis.
- Obslugiwane interakcje: brak.
- Obslugiwana walidacja: brak.
- Typy: `PreviewStatsVM`.
- Propsy: `totalCount`, `acceptedCount`.

### GenerationMetaPanel
- Opis komponentu: Sekcja pomocnicza z informacja o zrodle, jezykach i statusie.
- Glowne elementy: etykiety, chipy jezyka, status generacji.
- Obslugiwane interakcje: brak.
- Obslugiwana walidacja: brak.
- Typy: `GenerationMetaVM`.
- Propsy: `domain`, `sourceLanguage`, `targetLanguage`, `status`.

### DeckSelector
- Opis komponentu: Wybor talii do zapisu i akcja utworzenia nowej.
- Glowne elementy: `select`, przycisk "Utworz talie".
- Obslugiwane interakcje: wybor talii, otwarcie formularza tworzenia.
- Obslugiwana walidacja: wymagany `deck_id` przed zapisem.
- Typy: `DeckListItemDTO`, `DeckOptionVM`.
- Propsy: `items`, `value`, `onChange`, `onCreateClick`, `error`.

### InlineCreateDeckForm
- Opis komponentu: Formularz tworzenia talii inline.
- Glowne elementy: `input` nazwy, `textarea` opisu, przyciski "Zapisz/Anuluj".
- Obslugiwane interakcje: submit, cancel.
- Obsluga walidacji: nazwa min 3 znaki, unikalnosc (error 409).
- Typy: `CreateDeckCommand`, `CreateDeckResponseDTO`.
- Propsy: `onSubmit`, `onCancel`, `isSubmitting`, `error`.

### PreviewCardsList
- Opis komponentu: Lista kart do podgladu i edycji.
- Glowne elementy: `ul`, `PreviewCardItem`, `EmptyState`.
- Obslugiwane interakcje: delegacja do itemow.
- Obsluga walidacji: brak.
- Typy: `PreviewCardVM[]`.
- Propsy: `cards`, `onEdit`, `onDelete`, `onRestore`.

### PreviewCardItem
- Opis komponentu: Pojedyncza karta w liscie z akcjami.
- Glowne elementy: `article`, `button` edycji/usuniecia, podglad tresci.
- Obslugiwane interakcje: `edit`, `delete`, `restore`.
- Obsluga walidacji: brak.
- Typy: `PreviewCardVM`.
- Propsy: `card`, `onEdit`, `onDelete`, `onRestore`.

### PreviewCardEditor
- Opis komponentu: Edycja pytania i odpowiedzi.
- Glowne elementy: `textarea` pytanie, `textarea` odpowiedz, przyciski zapisu/anulowania.
- Obslugiwane interakcje: `save`, `cancel`, `change`.
- Obsluga walidacji: pytanie i odpowiedz 1-2000 znakow.
- Typy: `PreviewCardEditVM`.
- Propsy: `card`, `onSave`, `onCancel`, `errors`.

### AddManualCardForm
- Opis komponentu: Dodawanie nowej fiszki do listy.
- Glowne elementy: `textarea` pytanie, `textarea` odpowiedz, przycisk "Dodaj".
- Obslugiwane interakcje: `submit`, `cancel`.
- Obsluga walidacji: pytanie i odpowiedz 1-2000 znakow.
- Typy: `ManualCardDraftVM`.
- Propsy: `onSubmit`, `onCancel`, `errors`.

### RegenerationPanel
- Opis komponentu: Regeneracja z instrukcjami.
- Glowne elementy: `textarea` instrukcji, przycisk "Generuj ponownie".
- Obslugiwane interakcje: submit regeneracji.
- Obsluga walidacji: instrukcje max 1000 znakow.
- Typy: `RegenerationVM`.
- Propsy: `instructions`, `onChange`, `onSubmit`, `isSubmitting`.

### ActionBar
- Opis komponentu: Glowny pasek akcji.
- Glowne elementy: przyciski "Wstecz", "Anuluj", "Zapisz fiszki".
- Obslugiwane interakcje: `back`, `cancel`, `save`.
- Obsluga walidacji: blokada zapisu bez talii i bez kart.
- Typy: `ActionStateVM`.
- Propsy: `onBack`, `onCancel`, `onSave`, `canSave`.

### ErrorBanner
- Opis komponentu: Komunikaty bledow API i walidacji.
- Glowne elementy: `div` z trescia i CTA "Sprobuj ponownie".
- Obslugiwane interakcje: `retry`.
- Obsluga walidacji: brak.
- Typy: `UiErrorVM`.
- Propsy: `error`, `onRetry`.

### LoadingState / EmptyState
- Opis komponentu: Stany pomocnicze.
- Glowne elementy: spinner / komunikat pustej listy.
- Obslugiwane interakcje: brak.
- Obsluga walidacji: brak.
- Typy: brak.
- Propsy: `message`.

## 5. Typy
### DTO (istniejace)
- `GenerationRequestStatusResponseDTO`:
  - `id`, `status`, `error_code`, `error_message`, `preview_cards`.
- `PreviewCardDTO`:
  - `question`, `answer`, `source`.
- `AcceptGeneratedCardsCommand`:
  - `deck_id`, `cards`.
- `AcceptedCardInputDTO`:
  - `question`, `answer`, `original_question`, `original_answer`, `source`, `is_accepted`, `source_language`, `target_language`.
- `AcceptGeneratedCardsResponseDTO`:
  - `saved_count`, `flashcard_ids`.
- `GenerationRequestCreateCommand` + `GenerationRequestCreateResponseDTO`.
- `DeckListResponseDTO`, `DeckListItemDTO`.
- `CreateDeckCommand`, `CreateDeckResponseDTO`.
- `LanguageCode`, `FlashcardSource`.

### ViewModel (nowe)
- `PreviewCardVM`:
  - `localId: string` (client uuid)
  - `question: string`
  - `answer: string`
  - `originalQuestion: string | null`
  - `originalAnswer: string | null`
  - `source: 'ai'`
  - `sourceLanguage: LanguageCode`
  - `targetLanguage: LanguageCode`
  - `isAccepted: true`
  - `isModified: boolean`
  - `isDeleted: boolean`
  - `isManualAdded: boolean`
- `GenerationPreviewViewModel`:
  - `requestId: string`
  - `status: GenerationStatus`
  - `cards: PreviewCardVM[]`
  - `deckId: string | null`
  - `domain: string`
  - `sourceLanguage: LanguageCode`
  - `targetLanguage: LanguageCode`
  - `isLoading: boolean`
  - `error: UiErrorVM | null`
- `PreviewStatsVM`:
  - `totalCount: number`
  - `acceptedCount: number`
- `ManualCardDraftVM`:
  - `question: string`
  - `answer: string`
- `RegenerationVM`:
  - `instructions: string`
- `UiErrorVM`:
  - `code: string`
  - `message: string`
  - `retryable: boolean`

## 6. Zarzadzanie stanem
- Glowny stan widoku w `GeneratePreviewPage` (lub custom hook `useGenerationPreview`).
- Kluczowe pola stanu:
  - `requestId`, `status`, `cards`, `deckId`
  - `isLoading`, `isSaving`, `isRegenerating`
  - `editCardId`, `manualDraft`, `regenerationInstructions`
  - `errors` (walidacja + API)
- Custom hook:
  - `useGenerationPreview(requestId)`:
    - pobiera status generacji, wykonuje polling do `completed|failed`,
    - mapuje `PreviewCardDTO[]` na `PreviewCardVM[]`,
    - udostepnia akcje `editCard`, `deleteCard`, `restoreCard`, `addManualCard`.
- Dodatkowy hook:
  - `useDecks()`:
    - pobiera liste talii, obsluguje tworzenie nowej talii.

## 7. Integracja API
- `GET /api/generation-requests/{requestId}`:
  - Odbior: `GenerationRequestStatusResponseDTO`.
  - Akcja: pobranie statusu i kart do podgladu, polling co 2-3s do `completed`.
- `POST /api/generation-requests/{requestId}/accept`:
  - Wejscie: `AcceptGeneratedCardsCommand`.
  - Akcja: zapis kart do talii, sukces -> przekierowanie do `/decks/:deckId` lub `/dashboard`.
- `POST /api/generation-requests` (regeneracja):
  - Wejscie: `GenerationRequestCreateCommand` + `instructions`.
  - Akcja: tworzy nowy `requestId`, restartuje polling.
- `GET /api/decks?include_counts=false`:
  - Akcja: lista talii do dropdownu.
- `POST /api/decks`:
  - Akcja: utworzenie nowej talii inline.

## 8. Interakcje uzytkownika
- Edycja fiszki: otwarcie edytora, zapis lub anulowanie.
- Usuniecie fiszki: ukrycie z listy, aktualizacja licznika.
- Przywrocenie fiszki: cofniecie usuniecia.
- Dodanie manualnej fiszki: formularz -> dodanie do listy.
- Wybor talii: ustawienie `deckId` dla zapisu.
- Utworzenie nowej talii: inline form -> odswiezenie listy.
- Regeneracja: wpisanie instrukcji -> stworzenie nowego requestu.
- Zapis fiszek: walidacja -> POST accept -> przekierowanie.
- Nawigacja wstecz/anuluj: powrot do `/generate/input` lub `/dashboard`.

## 9. Warunki i walidacja
- `deck_id` wymagany przed zapisem.
- `cards` min 1, max 100 (blokada zapisu i komunikat).
- `question` i `answer` 1-2000 znakow (edycja i dodawanie).
- `instructions` max 1000 znakow.
- `source` musi byc `ai`, `is_accepted` musi byc `true`.
- `source_language` i `target_language` tylko `pl|en`.
- Blokada przycisku zapisu przy bledach walidacji.

## 10. Obsluga bledow
- 404 `requestId` -> komunikat + przekierowanie do `/generate/input`.
- 400 walidacja -> wyswietlenie bledow przy polach.
- 429 TooManyRequests -> przekierowanie do `/generate/error` lub banner z odliczaniem.
- 500/Network -> banner z opcja ponowienia.
- `status=failed` -> pokaz komunikat z `error_message`, zachowaj dane.

## 11. Kroki implementacji
1. Utworz strone `/generate/preview` i podlacz root React.
2. Zaimplementuj hook `useGenerationPreview` z pollingiem statusu.
3. Zmapuj `PreviewCardDTO` -> `PreviewCardVM` z polami `original*` i flagami.
4. Dodaj liste kart i edytor inline/modal z walidacja.
5. Zaimplementuj usuwanie/przywracanie i licznik kart.
6. Dodaj formularz manualnej fiszki i walidacje.
7. Dodaj wybor talii i inline tworzenie talii.
8. Dodaj regeneracje z instrukcjami (POST /api/generation-requests).
9. Zaimplementuj zapis kart (POST /api/generation-requests/{id}/accept).
10. Dodaj obsluge bledow i stany loading/pusty.
11. Dodaj przekierowania po sukcesie oraz przy braku `requestId`.
