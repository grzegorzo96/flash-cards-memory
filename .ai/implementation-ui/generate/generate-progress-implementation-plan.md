# Plan implementacji widoku Generowanie - w toku

## 1. Przeglad
Widok pokazuje status generowania i czeka na zakonczony request.

## 2. Routing widoku
- Sciezka: `/generate/progress`
- Parametr: `requestId` (query)

## 3. Struktura komponentow
- `GenerateProgressPage`
- `ProgressStatusCard`
- `CancelButton`
- `ErrorBanner`

## 4. Szczegoly komponentow
### GenerateProgressPage
- Opis: Polling statusu generacji i przekierowanie do podgladu.
- Typy: `GenerationRequestStatusResponseDTO`.

### ProgressStatusCard
- Opis: Komunikat o postepie i przewidywanym czasie.

### CancelButton
- Opis: Anulowanie flow (powrot do `/generate/input`).

## 5. Typy
- `GenerationRequestStatusResponseDTO` (`status`, `error_code`, `error_message`, `preview_cards`).

## 6. Zarzadzanie stanem
- `requestId`, `status`, `error`, `isPolling`.
- `useGenerationStatus(requestId)` z pollingiem co 2-3s.

## 7. Integracja API
- `GET /api/generation-requests/{requestId}`.

## 8. Interakcje uzytkownika
- Klik "Anuluj" -> powrot do `/generate/input` z zachowaniem danych.

## 9. Warunki i walidacja
- Brak `requestId` -> przekierowanie do `/generate/input`.

## 10. Obsluga bledow
- `status=failed` -> przekierowanie do `/generate/error`.
- 404 -> komunikat i powrot.
- 500 -> `ErrorBanner` + retry.

## 11. Kroki implementacji
1. Dodaj strone `/generate/progress`.
2. Zaimplementuj polling statusu.
3. Po `completed` przekieruj do `/generate/preview`.
4. Po `failed` przekieruj do `/generate/error`.
