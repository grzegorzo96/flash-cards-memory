# Plan implementacji widoku Logowanie

## 1. Przeglad
Widok logowania przygotowany pod przyszla autoryzacje (MVP bez auth).

## 2. Routing widoku
- Sciezka: `/login`

## 3. Struktura komponentow
- `LoginPage`
- `AuthForm`
- `FormField`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### AuthForm
- Opis: Pola `email` i `password`, linki do rejestracji i resetu.
- Walidacja: email format, haslo min 8.

## 5. Typy
- `AuthLoginVM` (`email`, `password`).

## 6. Zarzadzanie stanem
- `form`, `errors`, `isSubmitting`.

## 7. Integracja API
- W MVP brak wywolan (placeholder).

## 8. Interakcje uzytkownika
- Wpisanie danych.
- Nawigacja do `/register` i `/reset-password`.

## 9. Warunki i walidacja
- Format email, haslo min 8.

## 10. Obsluga bledow
- Walidacja lokalna, komunikaty pod polami.

## 11. Kroki implementacji
1. Dodaj strone `/login`.
2. Zbuduj formularz z walidacja.
3. Dodaj linki do innych widokow auth.
