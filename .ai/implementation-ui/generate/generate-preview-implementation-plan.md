# Plan implementacji widoku Generowanie - podglad fiszek

## 1. Przeglad
Widok `/generate/preview` sluzy do weryfikacji, edycji, usuwania i akceptacji fiszek wygenerowanych przez AI przed zapisem do wybranej talii. Umozliwia takze regeneracje z instrukcjami, dodanie fiszki manualnej oraz zapis zestawu do backendu.

## 2. Routing widoku
- Sciezka: `/generate/preview`
- Parametr: `requestId` (query)

## 3. Struktura komponentow
- `GeneratePreviewPage`
- `PreviewHeader`
- `DeckSelector`
- `InlineCreateDeckForm`
- `PreviewCardsList`
- `PreviewCardItem`
- `PreviewCardEditor`
- `AddManualCardForm`
- `RegenerationPanel`
- `ActionBar`
- `ErrorBanner`
- `LoadingState`
- `EmptyState`

## 4. Szczegoly komponentow
### GeneratePreviewPage
- Opis: Orkiestruje stan, pobiera status generacji, mapuje karty.
- Typy: `GenerationRequestStatusResponseDTO`, `DeckListResponseDTO`.

### DeckSelector
- Walidacja: wymagany `deck_id` przed zapisem.

### PreviewCardEditor / AddManualCardForm
- Walidacja: `question` i `answer` 1-2000 znakow.

### RegenerationPanel
- Walidacja: `instructions` max 1000 znakow.

## 5. Typy
- DTO: `GenerationRequestStatusResponseDTO`, `AcceptGeneratedCardsCommand`, `AcceptGeneratedCardsResponseDTO`.
- ViewModel: `PreviewCardVM`, `GenerationPreviewViewModel`, `UiErrorVM`.

## 6. Zarzadzanie stanem
- `cards`, `deckId`, `isSaving`, `isRegenerating`, `errors`.
- Hook `useGenerationPreview(requestId)` z pollingiem i mapowaniem.

## 7. Integracja API
- `GET /api/generation-requests/{requestId}`.
- `POST /api/generation-requests/{requestId}/accept`.
- `POST /api/generation-requests` (regeneracja).
- `GET /api/decks` (dropdown).
- `POST /api/decks` (inline create).

## 8. Interakcje uzytkownika
- Edycja/usuniecie/dodanie fiszki.
- Wybor lub utworzenie talii.
- Regeneracja z instrukcjami.
- Zapis fiszek.

## 9. Warunki i walidacja
- `deck_id` wymagane przed zapisem.
- `cards` min 1, max 100.
- `source` `ai`, `is_accepted` `true`, `language` `pl|en`.

## 10. Obsluga bledow
- 404 request -> komunikat i powrot.
- 429 -> `/generate/error`.
- 500 -> `ErrorBanner` + retry.

## 11. Kroki implementacji
1. Dodaj strone `/generate/preview`.
2. Zaimplementuj hook z pollingiem.
3. Dodaj liste i edytor fiszek.
4. Dodaj wybor/utworzenie talii.
5. Podlacz zapis i regeneracje.
