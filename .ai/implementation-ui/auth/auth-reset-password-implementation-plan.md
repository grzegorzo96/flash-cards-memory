# Plan implementacji widoku Reset hasla

## 1. Przeglad
Widok resetu hasla przygotowany pod przyszla autoryzacje.

## 2. Routing widoku
- Sciezka: `/reset-password`

## 3. Struktura komponentow
- `ResetPasswordPage`
- `AuthForm`
- `FormField`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### AuthForm
- Opis: Pole `email` i przycisk wysylki linku.
- Walidacja: poprawny email.

## 5. Typy
- `AuthResetVM` (`email`).

## 6. Zarzadzanie stanem
- `form`, `errors`, `isSubmitting`, `successMessage`.

## 7. Integracja API
- W MVP brak wywolan (placeholder).

## 8. Interakcje uzytkownika
- Wpisanie email i wyslanie.
- Przejscie do `/login`.

## 9. Warunki i walidacja
- Email wymagany i poprawny.

## 10. Obsluga bledow
- Walidacja lokalna.

## 11. Kroki implementacji
1. Dodaj strone `/reset-password`.
2. Zbuduj formularz z walidacja.
