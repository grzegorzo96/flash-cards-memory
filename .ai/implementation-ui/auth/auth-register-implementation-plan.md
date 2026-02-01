# Plan implementacji widoku Rejestracja

## 1. Przeglad
Widok rejestracji przygotowany pod przyszla autoryzacje.

## 2. Routing widoku
- Sciezka: `/register`

## 3. Struktura komponentow
- `RegisterPage`
- `AuthForm`
- `FormField`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### AuthForm
- Opis: Pola `email`, `password`, `confirmPassword`.
- Walidacja: email format, haslo min 8, zgodnosc hasel.

## 5. Typy
- `AuthRegisterVM` (`email`, `password`, `confirmPassword`).

## 6. Zarzadzanie stanem
- `form`, `errors`, `isSubmitting`.

## 7. Integracja API
- W MVP brak wywolan (placeholder).

## 8. Interakcje uzytkownika
- Wpisanie danych, klik "Zarejestruj".

## 9. Warunki i walidacja
- Email poprawny, haslo min 8, potwierdzenie zgodne.

## 10. Obsluga bledow
- Walidacja lokalna.

## 11. Kroki implementacji
1. Dodaj strone `/register`.
2. Zbuduj formularz z walidacja.
