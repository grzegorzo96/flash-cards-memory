# Plan implementacji widoku Generowanie - blad

## 1. Przeglad
Widok obsluguje timeouty, 429 i bledy generowania bez utraty danych.

## 2. Routing widoku
- Sciezka: `/generate/error`
- Parametry: `code`, `message` (opcjonalnie w query)

## 3. Struktura komponentow
- `GenerateErrorPage`
- `ErrorMessageCard`
- `RetryCountdown`
- `PrimaryAction`
- `SecondaryAction`

## 4. Szczegoly komponentow
### GenerateErrorPage
- Opis: Dobiera tresc komunikatu na podstawie `code`.

### RetryCountdown
- Opis: Odliczanie dla 429 (np. 60s).

### PrimaryAction
- Opis: "Sprobuj ponownie".

### SecondaryAction
- Opis: "Wroc do edycji tekstu".

## 5. Typy
- `UiErrorVM` (`code`, `message`, `retryable`).

## 6. Zarzadzanie stanem
- `error`, `countdown`, `canRetry`.

## 7. Integracja API
- Brak (tylko nawigacja do `/generate/input`).

## 8. Interakcje uzytkownika
- Retry po odliczaniu -> powrot do `/generate/input` z zachowaniem tekstu.

## 9. Warunki i walidacja
- Dla 429 wymusz odczekanie przed retry.

## 10. Obsluga bledow
- Brak dodatkowych (to widok bledu).

## 11. Kroki implementacji
1. Dodaj strone `/generate/error`.
2. Zmapuj `code` na komunikaty.
3. Dodaj odliczanie dla 429.
4. Dodaj akcje retry i powrot.
