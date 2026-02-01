# Plan implementacji widoku Generowanie - wprowadzanie tekstu

## 1. Przeglad
Uzytkownik wkleja tekst zrodlowy, wybiera jezyk docelowy i uruchamia generowanie.

## 2. Routing widoku
- Sciezka: `/generate/input`

## 3. Struktura komponentow
- `GenerateInputPage`
- `SourceTextField`
- `DomainSelect`
- `LanguageSelect`
- `HelperTips`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### GenerateInputPage
- Opis: Strona z formularzem do generowania.
- Typy: `GenerationRequestCreateCommand`, `GenerationRequestCreateResponseDTO`.

### SourceTextField
- Opis: Pole tekstowe z licznikiem znakow.
- Walidacja: min 100, max 5000.

### LanguageSelect
- Opis: Wybierak `target_language` (`pl|en` wg API).
- Walidacja: wymagane.

### HelperTips
- Opis: Tooltipy i wskazowki jak przygotowac tekst.

### ActionBar
- Opis: Przyciski "Generuj" i "Wstecz".

## 5. Typy
- `GenerationRequestCreateCommand` (`deck_id?`, `source_text`, `domain`, `target_language`, `instructions?`).
- `GenerationRequestCreateResponseDTO` (`id`, `status`, `detected_source_language`).

## 6. Zarzadzanie stanem
- `sourceText`, `domain`, `targetLanguage`, `errors`, `isSubmitting`.
- `useGenerationCreate()` do wysylki.

## 7. Integracja API
- `POST /api/generation-requests` -> `202 Accepted`.

## 8. Interakcje uzytkownika
- Wklejenie tekstu.
- Wybor jezyka i domeny.
- Klik "Generuj" -> przejscie do `/generate/progress?requestId=...`.
- Klik "Wstecz" -> `/generate/setup`.

## 9. Warunki i walidacja
- `source_text` 1-5000, UI min 100.
- `domain` wymagany.
- `target_language` `pl|en`.

## 10. Obsluga bledow
- 400 walidacja -> bledy przy polach.
- 429 -> przekierowanie do `/generate/error`.
- 500 -> `ErrorBanner`, zachowaj tekst.

## 11. Kroki implementacji
1. Dodaj strone `/generate/input`.
2. Dodaj licznik znakow i walidacje.
3. Podlacz POST /api/generation-requests.
4. Po sukcesie przejdz do `/generate/progress`.
