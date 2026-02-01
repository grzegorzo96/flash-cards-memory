# Unit Tests Documentation

## 📋 Przegląd

Projekt zawiera kompleksowy zestaw testów jednostkowych dla kluczowych modułów aplikacji FlashCardsMemory. Testy skupiają się na czystych funkcjach i logice biznesowej bez zależności zewnętrznych.

## 🎯 Pokrycie testami

### Priorytety testowania (133 testy w sumie)

| Moduł | Testy | Priorytet | Status |
|-------|-------|-----------|--------|
| **fsrs.ts** | 27 | 🔥 High | ✅ 100% |
| **languageDetector.ts** | 46 | 🔥 High | ✅ 100% |
| **errors.ts** | 38 | 🔥 High | ✅ 100% |
| **previewCardsStore.ts** | 22 | 🔥 High | ✅ 100% |

## 📁 Struktura testów

```
tests/
├── lib/
│   ├── helpers/
│   │   ├── fsrs.test.ts                    (27 testów)
│   │   └── languageDetector.test.ts        (46 testów)
│   └── services/
│       ├── openrouter/
│       │   └── errors.test.ts              (38 testów)
│       └── ai-generations/
│           └── previewCardsStore.test.ts   (22 testy)
```

## 🧪 Szczegółowy opis testów

### 1. FSRS (Free Spaced Repetition Scheduler) - 27 testów

**Lokalizacja:** `tests/lib/helpers/fsrs.test.ts`

#### Testowane funkcje:
- ✅ `calculateNextReview()` - Obliczanie następnej powtórki
- ✅ `selectCardsForReview()` - Wybór kart do powtórki

#### Kluczowe scenariusze:

**calculateNextReview():**
- ✅ Inicjalizacja nowych kart z domyślnymi parametrami
- ✅ Obsługa wszystkich ratingów (1-4: Again, Hard, Good, Easy)
- ✅ Aktualizacja parametrów dla istniejących kart
- ✅ Przestrzeganie limitów (stability min 0.1, difficulty 1-10)
- ✅ Obliczanie poprawnych dat następnej powtórki
- ✅ Walidacja błędnych ratingów
- ✅ Obsługa skrajnych wartości (bardzo wysokie/niskie stability)
- ✅ Poprawne obliczanie retrievability

**selectCardsForReview():**
- ✅ Priorytetyzacja kart nigdy nieprzeglądanych
- ✅ Sortowanie kart zaległych według stopnia zaległości
- ✅ Filtrowanie kart przyszłych
- ✅ Respektowanie limitu kart
- ✅ Obsługa pustych tablic
- ✅ Mieszane scenariusze (różne typy kart)

#### Reguły biznesowe:
- Rating 1 (Again): stability × 0.5, difficulty +1, ~2.4h
- Rating 2 (Hard): stability × 0.85, difficulty +0.5, stability × 1.2 dni
- Rating 3 (Good): stability × 2.5, difficulty -0.3, stability × 2.5 dni
- Rating 4 (Easy): stability × 4, difficulty -0.5, stability × 4 dni

---

### 2. Language Detector - 46 testów

**Lokalizacja:** `tests/lib/helpers/languageDetector.test.ts`

#### Testowane funkcje:
- ✅ `detectLanguage()` - Detekcja języka tekstu (PL/EN)

#### Kluczowe scenariusze:

**Detekcja języka polskiego:**
- ✅ Po polskich znakach specjalnych (ąćęłńóśźż) - każdy pojedynczo
- ✅ Po wielu polskich znakach jednocześnie
- ✅ Po polskich słowach (jest, są, będzie, może, który, która, które, oraz, albo, aby, żeby)
- ✅ Wymóg >2 polskich słów do detekcji (threshold)
- ✅ Prawdziwe teksty edukacyjne po polsku

**Detekcja języka angielskiego:**
- ✅ Tekst bez polskich znaków
- ✅ Treści techniczne/programistyczne
- ✅ Tekst z cyframi i symbolami

**Edge cases:**
- ✅ Pusty string → domyślnie 'en'
- ✅ Same białe znaki → 'en'
- ✅ Same cyfry/symbole → 'en'
- ✅ Pojedynczy polski znak → 'pl'
- ✅ Bardzo długie teksty (PL i EN)
- ✅ Case-insensitive detection
- ✅ Mieszana zawartość (kod + komentarze)

#### Reguły biznesowe:
- Wykrycie ≥1 polskiego znaku → język polski
- Wykrycie >2 polskich słów → język polski
- W przeciwnym razie → język angielski (domyślny)

---

### 3. OpenRouter Errors - 38 testów

**Lokalizacja:** `tests/lib/services/openrouter/errors.test.ts`

#### Testowane klasy:
- ✅ `OpenRouterError` (klasa bazowa)
- ✅ `ConfigurationError`
- ✅ `AuthError`
- ✅ `RateLimitError`
- ✅ `UpstreamError`
- ✅ `SchemaValidationError`
- ✅ `TimeoutError`
- ✅ `InvalidPayloadError`
- ✅ `EmptyResponseError`

#### Kluczowe scenariusze:

**Dla każdej klasy błędu:**
- ✅ Tworzenie z message i code
- ✅ Przechowywanie originalError
- ✅ Poprawny name i code
- ✅ Dziedziczenie z OpenRouterError i Error
- ✅ instanceof checks

**Specjalne właściwości:**
- ✅ `RateLimitError.retryAfter` - czas retry (opcjonalny)
- ✅ `UpstreamError.statusCode` - kod HTTP (opcjonalny)
- ✅ `SchemaValidationError.validationErrors` - błędy walidacji (opcjonalne)

**Hierarchia błędów:**
- ✅ Możliwość catch'owania wszystkich jako OpenRouterError
- ✅ Możliwość catch'owania specyficznych typów
- ✅ Serializacja do string

#### Kody błędów:
- `CONFIGURATION_ERROR` - błędy konfiguracji
- `AUTH_ERROR` - błędy autoryzacji (401, 403)
- `RATE_LIMIT_ERROR` - przekroczenie limitu (429)
- `UPSTREAM_ERROR` - błędy usługi upstream (5xx)
- `SCHEMA_VALIDATION_ERROR` - błędy walidacji schematu
- `TIMEOUT_ERROR` - timeout zapytania
- `INVALID_PAYLOAD_ERROR` - nieprawidłowy payload
- `EMPTY_RESPONSE_ERROR` - pusta odpowiedź

---

### 4. Preview Cards Store - 22 testy

**Lokalizacja:** `tests/lib/services/ai-generations/previewCardsStore.test.ts`

#### Testowane metody:
- ✅ `set(requestId, cards)` - Zapisywanie kart
- ✅ `get(requestId)` - Pobieranie kart
- ✅ `delete(requestId)` - Usuwanie kart
- ✅ `clear()` - Czyszczenie całego store

#### Kluczowe scenariusze:

**set() i get():**
- ✅ Zapisywanie i odczytywanie kart dla requestId
- ✅ Obsługa pojedynczej karty
- ✅ Obsługa pustej tablicy
- ✅ Undefined dla nieistniejącego requestId
- ✅ Wiele różnych requestIds jednocześnie
- ✅ Nadpisywanie istniejących danych

**delete():**
- ✅ Usuwanie kart dla konkretnego requestId
- ✅ Inne requestIds pozostają nienaruszone
- ✅ Obsługa nieistniejącego requestId (nie rzuca błędu)
- ✅ Wielokrotne usuwanie tego samego requestId

**clear():**
- ✅ Czyszczenie wszystkich danych
- ✅ Czyszczenie pustego store
- ✅ Możliwość dodawania danych po clear()

**Złożone scenariusze:**
- ✅ Wiele kart (100+) dla jednego requestu
- ✅ Wiele requestIds (50+) jednocześnie
- ✅ Szybkie operacje (set, delete, set)
- ✅ Karty ze znakami specjalnymi (polskie, matematyczne, kod)
- ✅ Bardzo długie treści (10000+ znaków)

**Edge cases:**
- ✅ Pusty string jako requestId
- ✅ requestId ze znakami specjalnymi
- ✅ Podobne ale różne requestIds ('1' vs '01')

#### Uwaga:
Store używa Map (in-memory), więc mutacje na zwróconych danych wpływają na store. W produkcji rozważ deep copy lub structuredClone.

---

## 🚀 Uruchamianie testów

### Wszystkie testy jednostkowe
```bash
npm test -- --run tests/lib/
```

### Konkretny moduł
```bash
npm test -- --run tests/lib/helpers/fsrs.test.ts
npm test -- --run tests/lib/helpers/languageDetector.test.ts
npm test -- --run tests/lib/services/openrouter/errors.test.ts
npm test -- --run tests/lib/services/ai-generations/previewCardsStore.test.ts
```

### Watch mode (development)
```bash
npm test -- tests/lib/helpers/fsrs.test.ts
```

### Z coverage
```bash
npm test -- --coverage tests/lib/
```

### UI mode
```bash
npm test -- --ui tests/lib/
```

## 📊 Wyniki testów

```
✓ tests/lib/helpers/fsrs.test.ts (27 tests)
✓ tests/lib/helpers/languageDetector.test.ts (46 tests)
✓ tests/lib/services/openrouter/errors.test.ts (38 tests)
✓ tests/lib/services/ai-generations/previewCardsStore.test.ts (22 tests)

Test Files  4 passed (4)
Tests  133 passed (133)
Duration  ~600ms
```

## 🎯 Zasady testowania (Vitest Best Practices)

### 1. Struktura testów
- ✅ Arrange-Act-Assert pattern
- ✅ Descriptive test names
- ✅ Grupowanie z `describe` blocks
- ✅ Czyszczenie stanu w `beforeEach`

### 2. Mockowanie
- ✅ `vi.fn()` dla mocków funkcji
- ✅ `vi.spyOn()` dla monitorowania
- ✅ `vi.useFakeTimers()` dla Date.now()
- ✅ `vi.clearAllMocks()` w cleanup

### 3. Asercje
- ✅ Explicit assertion messages
- ✅ `toEqual()` dla obiektów/tablic
- ✅ `toBe()` dla prymitywów
- ✅ `toThrow()` dla błędów
- ✅ `toBeInstanceOf()` dla typów

### 4. Edge cases
- ✅ Empty inputs
- ✅ Null/undefined
- ✅ Boundary values
- ✅ Very large inputs
- ✅ Special characters
- ✅ Invalid inputs

## 📈 Metryki

| Metryka | Wartość |
|---------|---------|
| **Całkowita liczba testów** | 133 |
| **Współczynnik powodzenia** | 100% |
| **Średni czas wykonania** | ~600ms |
| **Liczba modułów** | 4 |
| **Pokrycie priorytetów** | 4/4 (100%) |

## 🔄 Continuous Integration

Testy są automatycznie uruchamiane w CI/CD pipeline:
- ✅ Pre-commit hook (Husky)
- ✅ GitHub Actions workflow
- ✅ Pull Request checks

## 📝 Konwencje

### Nazewnictwo plików
```
src/lib/helpers/fsrs.ts → tests/lib/helpers/fsrs.test.ts
```

### Nazewnictwo testów
```typescript
describe('ModuleName', () => {
  describe('functionName()', () => {
    describe('Group of related tests', () => {
      it('should do something specific', () => {
        // test
      });
    });
  });
});
```

## 🎓 Kluczowe wnioski

### Dlaczego te moduły?

1. **FSRS** - Core business logic, matematyczne obliczenia, zero side effects
2. **Language Detector** - Wpływ na jakość AI, heurystyka, pure function
3. **Errors** - Krytyczne dla error handling, proste klasy, łatwe do testowania
4. **Preview Cards Store** - Stateful logic, krytyczny dla flow AI, in-memory

### Co NIE jest testowane unit testami?

- ❌ Custom Hooks (wymagają React context)
- ❌ API Endpoints (wymagają Astro context, Supabase)
- ❌ React Components (lepsze dla E2E/integration)
- ❌ Database services (wymagają mocków DB)

Te elementy są testowane w:
- Integration tests (z msw mocks)
- E2E tests (Playwright)

## 🔮 Kolejne kroki

### Priorytety dla rozszerzenia testów:

1. **Utils.ts** - Funkcja `cn()` (Tailwind merge)
2. **Service error mapping** - createDeck, generateFlashcardsWithAI
3. **Validation logic** - Zod schemas dla DTOs
4. **Helper functions** - Parsing, formatting, transformations

### Improvement opportunities:

- [ ] Snapshot testing dla złożonych obiektów
- [ ] Performance benchmarking dla FSRS
- [ ] Mutation testing (Stryker)
- [ ] Property-based testing (fast-check)

---

**Ostatnia aktualizacja:** 2024-01-15  
**Autor:** AI Assistant  
**Framework:** Vitest 4.0.18  
**Node:** v20+
