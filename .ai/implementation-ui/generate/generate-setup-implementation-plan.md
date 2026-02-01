# Plan implementacji widoku Generowanie - ustawienia startowe

## 1. Przeglad
Pierwszy krok flow generowania AI. Uzytkownik wybiera dziedzine (domain) i przechodzi do wpisania tekstu.

## 2. Routing widoku
- Sciezka: `/generate/setup`

## 3. Struktura komponentow
- `GenerateSetupPage`
- `DomainSelect`
- `PrimaryAction`
- `ErrorBanner`

## 4. Szczegoly komponentow
### GenerateSetupPage
- Opis: Strona z wyborem domeny.
- Typy: `GenerationRequestCreateCommand` (pole `domain`).

### DomainSelect
- Opis: Dropdown z listy domen.
- Walidacja: wymagany wybor (domyslnie "Inne").
- Propsy: `value`, `onChange`.

### PrimaryAction
- Opis: Przycisk "Kontynuuj".
- Walidacja: aktywny tylko przy poprawnym domain.

## 5. Typy
- `GenerationRequestCreateCommand` (uzywamy tylko `domain` na tym kroku).
- `DomainOptionVM` (lista stringow z PRD).

## 6. Zarzadzanie stanem
- `domain` w stanie lokalnym lub globalnym flow (np. context).

## 7. Integracja API
- Brak wywolan API na tym kroku.

## 8. Interakcje uzytkownika
- Wybor domeny -> zapis w stanie flow.
- Klik "Kontynuuj" -> `/generate/input`.

## 9. Warunki i walidacja
- `domain` niepuste, max 100 znakow.

## 10. Obsluga bledow
- Brak (tylko walidacja UI).

## 11. Kroki implementacji
1. Dodaj strone `/generate/setup`.
2. Zbuduj `DomainSelect` z lista domen z PRD.
3. Zapisz `domain` w stanie flow i przejdz do `/generate/input`.
