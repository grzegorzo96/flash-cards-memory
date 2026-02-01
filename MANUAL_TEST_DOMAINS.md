# Instrukcja testowania funkcjonalności dziedzin

## Przygotowanie

1. Upewnij się, że serwer deweloperski działa:
   ```bash
   npm run dev
   ```
   
2. Serwer powinien być dostępny na: `http://localhost:4322`

## Test 1: Zapisywanie dziedziny jako zalogowany użytkownik

### Krok 1: Zaloguj się
1. Otwórz: `http://localhost:4322/login`
2. Wprowadź dane testowe:
   - Email: `grze963@gmail.com`
   - Hasło: `Dupa123!@#`
3. Kliknij "Zaloguj się"

### Krok 2: Przejdź do generowania fiszek
1. Z menu bocznego wybierz "Generuj Fiszki" lub przejdź do: `http://localhost:4322/generate/setup`

### Krok 3: Sprawdź predefiniowane dziedziny
Powinieneś zobaczyć przyciski z dziedzinami:
- Programowanie
- Języki obce
- Medycyna
- Prawo
- Historia
- Geografia
- Matematyka
- Fizyka
- Chemia
- Biologia
- Inne

### Krok 4: Dodaj własną dziedzinę
1. Kliknij przycisk "Inne"
2. Powinieneś zobaczyć pole tekstowe "Własna dziedzina"
3. Wprowadź nazwę dziedziny, np. "Astronomia"
4. Powinieneś zobaczyć komunikat: "Nowa dziedzina zostanie zapisana dla przyszłych użyć"
5. Kliknij "Kontynuuj"

### Krok 5: Zweryfikuj zapisanie dziedziny
1. Wróć do: `http://localhost:4322/generate/setup`
2. **Sprawdź czy "Astronomia" pojawia się teraz w liście przycisków dziedzin**
3. ✅ **Sukces!** Dziedzina została zapisana i jest widoczna

### Krok 6: Użyj zapisanej dziedziny
1. Kliknij przycisk "Astronomia"
2. Kliknij "Kontynuuj"
3. Na następnej stronie (`/generate/input`) powinieneś zobaczyć:
   - "Dziedzina: **Astronomia**"

## Test 2: Testowanie jako gość (niezalogowany)

### Krok 1: Wyloguj się
1. Z menu bocznego wybierz opcję wylogowania lub przejdź do: `http://localhost:4322/logout`

### Krok 2: Przejdź do generowania fiszek
1. Otwórz: `http://localhost:4322/generate/setup`

### Krok 3: Sprawdź widok dla gościa
Powinieneś zobaczyć:
- Tylko predefiniowane dziedziny (bez Twoich własnych dziedzin)
- Przycisk "Inne"

### Krok 4: Wprowadź własną dziedzinę jako gość
1. Kliknij "Inne"
2. Wprowadź nazwę dziedziny, np. "Ekonomia"
3. **Nie** powinieneś widzieć komunikatu o zapisywaniu dziedziny
4. Kliknij "Kontynuuj"

### Krok 5: Zweryfikuj że dziedzina NIE została zapisana
1. Wróć do: `http://localhost:4322/generate/setup`
2. **Sprawdź że "Ekonomia" NIE pojawia się w liście dziedzin**
3. ✅ **Sukces!** Goście nie mogą zapisywać dziedzin

## Test 3: Duplikaty dziedzin

### Krok 1: Zaloguj się ponownie
1. Zaloguj się jako: `grze963@gmail.com` / `Dupa123!@#`

### Krok 2: Spróbuj dodać istniejącą dziedzinę
1. Przejdź do: `http://localhost:4322/generate/setup`
2. Kliknij "Inne"
3. Wprowadź nazwę dziedziny, którą już dodałeś (np. "Astronomia")
4. Kliknij "Kontynuuj"

### Krok 3: Sprawdź listę dziedzin
1. Wróć do: `http://localhost:4322/generate/setup`
2. **Sprawdź że "Astronomia" pojawia się tylko raz** (nie ma duplikatu)
3. ✅ **Sukces!** System zapobiega duplikatom

## Test 4: Różne wielkości liter i spacje

### Krok 1: Dodaj dziedzinę ze spacjami
1. Kliknij "Inne"
2. Wprowadź: "  Bioinformatyka  " (ze spacjami na początku i końcu)
3. Kliknij "Kontynuuj"

### Krok 2: Sprawdź zapisaną nazwę
1. Wróć do: `http://localhost:4322/generate/setup`
2. **Sprawdź że przycisk ma nazwę "Bioinformatyka"** (bez spacji)
3. ✅ **Sukces!** System automatycznie usuwa spacje

## Weryfikacja w bazie danych (opcjonalnie)

Jeśli chcesz sprawdzić dane bezpośrednio w bazie:

```bash
npx supabase db psql
```

Następnie wykonaj zapytanie:

```sql
SELECT id, name, created_at 
FROM domains 
WHERE user_id = '8db7f0bc-a0a3-4cb9-9a6c-ea874aaf85bc'
ORDER BY created_at DESC;
```

Powinieneś zobaczyć wszystkie dziedziny dodane przez użytkownika testowego.

## Oczekiwane zachowanie

### Dla zalogowanych użytkowników:
- ✅ Widzą predefiniowane dziedziny + swoje własne dziedziny
- ✅ Mogą dodać nową dziedzinę wybierając "Inne"
- ✅ Nowa dziedzina jest zapisywana w bazie danych
- ✅ Dziedzina pojawia się w liście przy następnym użyciu
- ✅ System zapobiega duplikatom
- ✅ Spacje są automatycznie usuwane

### Dla gości (niezalogowanych):
- ✅ Widzą tylko predefiniowane dziedziny
- ✅ Mogą wprowadzić własną dziedzinę, ale nie jest zapisywana
- ✅ Nie widzą komunikatu o zapisywaniu dziedziny
- ✅ Dziedzina działa dla bieżącej sesji (sessionStorage)

## Troubleshooting

### Problem: Nie widzę nowych dziedzin
- Sprawdź czy jesteś zalogowany
- Odśwież stronę (F5)
- Sprawdź konsolę przeglądarki (F12) czy są błędy

### Problem: Błąd 401 Unauthorized
- Upewnij się, że jesteś zalogowany
- Sprawdź czy sesja nie wygasła

### Problem: Dziedzina się nie zapisuje
- Sprawdź konsolę przeglądarki (F12) czy są błędy API
- Sprawdź czy baza danych działa: `npx supabase status`
- Sprawdź logi serwera
