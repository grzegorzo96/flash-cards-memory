# Funkcjonalność zapisywania dziedzin

## Opis

System pozwala użytkownikom na zapisywanie własnych dziedzin, które będą pojawiać się w liście sugestii przy następnym generowaniu fiszek.

## Implementacja

### 1. Baza danych

Utworzono tabelę `domains`:
- `id` - UUID (primary key)
- `user_id` - UUID (foreign key do auth.users)
- `name` - TEXT (nazwa dziedziny, 2-100 znaków)
- `created_at` - TIMESTAMPTZ

**Constraints:**
- Unikalność: `(user_id, name)` - użytkownik nie może mieć duplikatów dziedzin
- RLS policies: użytkownik widzi tylko swoje dziedziny

**Migracja:** `supabase/migrations/20260201224254_create_domains_table.sql`

### 2. Backend API

#### GET /api/domains
Zwraca listę dziedzin użytkownika posortowanych od najnowszych.

**Wymagania:**
- Użytkownik musi być zalogowany (401 w przeciwnym razie)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Astronomia",
    "created_at": "2026-02-01T..."
  }
]
```

#### POST /api/domains
Tworzy nową dziedzinę dla użytkownika.

**Wymagania:**
- Użytkownik musi być zalogowany (401 w przeciwnym razie)
- `name` - 2-100 znaków

**Request:**
```json
{
  "name": "Ekonomia"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Ekonomia"
}
```

**Uwaga:** Jeśli dziedzina już istnieje dla danego użytkownika, zwraca istniejącą dziedzinę zamiast błędu.

### 3. Frontend

#### Komponenty React

**Hooki:**
- `useDomainsList(isAuthenticated)` - pobiera dziedziny użytkownika
- `useCreateDomain()` - tworzy nową dziedzinę

**Komponent:**
- `GenerateSetupPage` - zaktualizowany o obsługę dziedzin

#### Workflow

1. Użytkownik otwiera `/generate/setup`
2. Widzi listę dziedzin:
   - Predefiniowane (Programowanie, Języki obce, itp.)
   - **Własne dziedziny użytkownika** (jeśli zalogowany)
   - "Inne" (do wprowadzenia nowej)
3. Wybiera dziedzinę lub wprowadza własną
4. Po kliknięciu "Kontynuuj":
   - **Jeśli zalogowany i wybrano "Inne"** - nowa dziedzina jest zapisywana do bazy
   - Dziedzina jest zapisywana w sessionStorage
   - Przekierowanie do `/generate/input`

#### Obsługa niezalogowanych użytkowników

- Niezalogowani widzą tylko predefiniowane dziedziny
- Mogą wprowadzić własną dziedzinę, ale nie zostanie zapisana
- Nie widzą komunikatu "Nowa dziedzina zostanie zapisana..."

## Testowanie

### Test manualny

1. **Zaloguj się** jako użytkownik testowy:
   - Email: `grze963@gmail.com`
   - Hasło: `Dupa123!@#`

2. **Otwórz** `http://localhost:4322/generate/setup`

3. **Sprawdź** czy widzisz:
   - Predefiniowane dziedziny
   - Przycisk "Inne"

4. **Kliknij "Inne"** i wprowadź własną dziedzinę (np. "Astronomia")

5. **Kliknij "Kontynuuj"**

6. **Wróć** do `/generate/setup`

7. **Sprawdź** czy "Astronomia" pojawiła się w liście dziedzin

### Test jako gość

1. **Wyloguj się** (jeśli jesteś zalogowany)

2. **Otwórz** `http://localhost:4322/generate/setup`

3. **Sprawdź** czy:
   - Widzisz tylko predefiniowane dziedziny
   - Możesz wybrać "Inne" i wprowadzić własną
   - NIE widzisz komunikatu o zapisywaniu dziedziny

### Test API

```bash
# GET /api/domains (wymaga zalogowania)
curl http://localhost:4322/api/domains \
  -H "Cookie: session=..."

# POST /api/domains (wymaga zalogowania)
curl -X POST http://localhost:4322/api/domains \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{"name": "Astronomia"}'
```

## Pliki zmienione

### Nowe pliki:
- `supabase/migrations/20260201224254_create_domains_table.sql`
- `src/lib/services/domains/listDomains.ts`
- `src/lib/services/domains/createDomain.ts`
- `src/pages/api/domains/index.ts`
- `src/components/hooks/useDomainsList.ts`
- `src/components/hooks/useCreateDomain.ts`

### Zmodyfikowane pliki:
- `src/types.ts` - dodano typy Domain, DomainListItemDTO, CreateDomainCommand, CreateDomainResponseDTO
- `src/components/generate/GenerateSetupPage.tsx` - dodano obsługę dziedzin użytkownika
- `src/pages/generate/setup.astro` - przekazywanie stanu autentykacji
- `src/db/database.types.ts` - automatycznie wygenerowane typy z bazy danych

## Następne kroki (opcjonalne ulepszenia)

1. **Usuwanie dziedzin** - dodać endpoint DELETE /api/domains/:id
2. **Limit dziedzin** - ograniczyć liczbę dziedzin użytkownika (np. max 20)
3. **Sortowanie** - pozwolić użytkownikowi sortować dziedziny (alfabetycznie, po dacie)
4. **Wyszukiwanie** - dodać wyszukiwanie dziedzin dla użytkowników z wieloma dziedzinami
5. **Udostępnianie** - pozwolić użytkownikom udostępniać dziedziny innym
