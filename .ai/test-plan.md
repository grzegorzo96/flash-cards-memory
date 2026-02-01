# Plan testów — 10xCards

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie stabilności, bezpieczeństwa i jakości aplikacji 10xCards poprzez weryfikację krytycznych ścieżek użytkownika (autoryzacja, CRUD decków/flashcards, sesje nauki, integracja AI), poprawności API, odporności na błędy zewnętrznych usług (Supabase, OpenRouter), oraz akceptowalnej wydajności i użyteczności interfejsu. Testy mają wykryć regresje, luki bezpieczeństwa i problemy UX przed wdrożeniem na produkcję.

## 2. Zakres testów
- Frontend (Astro + React + TypeScript + Tailwind + Shadcn/ui)
  - Komponenty interaktywne (reactowe)
  - Strony Astro (rendering SSR/SSG tam, gdzie występuje)
  - Responsywność i dostępność (a11y)
- Backend (API endpoints w `src/pages/api/*`, Supabase)
  - Endpoints: auth (login/register/reset/update), decks, flashcards, generation-requests, study-sessions, dashboard
  - Supabase client, migracje i typy DB
- Integracje zewnętrzne
  - Supabase (DB + auth)
  - OpenRouter / modele AI (generowanie treści)
  - CI/CD (GitHub Actions), środowisko staging
- Inne:
  - Middleware (sesje, auth)
  - Lintery / budowanie (tsc, build pipeline)
  - Migracje i skrypty DB

## 3. Typy testów do przeprowadzenia
1. Testy jednostkowe (unit)
   - Logika: helpery, serwisy (`src/lib/services/*`), custom hooks (`src/components/hooks`)
   - Framework: Vitest/Jest + ts-node
2. Testy integracyjne (integration)
   - API endpoints (bez i z mockiem Supabase) — Supertest / Playwright API
   - Komponenty React współpracujące z hookami i serwisami
   - Testy integracji z OpenRouter (mockowane)
3. Testy end-to-end (E2E)
   - Scenariusze użytkownika (Playwright lub Cypress)
   - Ścieżki: rejestracja/logowanie, tworzenie talii/flashcardów, generowanie kart AI, sesja nauki, akceptacja wygenerowanych kart
4. Testy bezpieczeństwa (security)
   - Autoryzacja/ uprawnienia (dostęp do cudzych decków/flashcards)
   - SQL injection / input validation / XSS
   - Exposed secrets / env vars
5. Testy wydajnościowe (performance)
   - Load testy dla API (k6) — główne endpoints (listDecks, generate request)
   - Render/Time-to-interactive dla stron krytycznych (Lighthouse / WebPageTest)
6. Testy użyteczności i dostępności (a11y)
   - Lighthouse a11y / axe-core automatycznie + manualne sprawdzenie na kluczowych ekranach
7. Testy regresji automatycznej
   - Uruchamiane w CI przy push/PR (unit + integracyjne smoke + E2E nightly dla głównych przepływów)
8. Testy kontraktowe / umów (contract)
   - Sprawdzenie kontraktów API między frontendem a backendem (OpenAPI/schema lub snapshoty)
9. Testy resiliency / chaos
   - Symulacja awarii OpenRouter / Supabase (timeouty, błędy 500) i obserwacja zachowania UI/ retry / fallback

## 4. Scenariusze testowe dla kluczowych funkcjonalności
Poniżej wybrane szczegółowe scenariusze (krok i oczekiwany rezultat). Testy E2E + integracyjne + jednostkowe dla logiki.

A. Autoryzacja i użytkownicy
- Rejestracja (happy path)
  1. Wejście na `/register`, wypełnienie poprawnych danych, submit
  2. Oczekiwane: 201/redirect do dashboard, token zapisany, użytkownik widzi swoje decki
- Rejestracja (walidacje)
  - brak wymaganych pól → walidacja klient/serwer, komunikat błędu
- Login / Logout / Reset hasła / Update password
  - Test poprawnych i niepoprawnych danych, token expiry, ochrona endpointów (401)
- Bezpieczeństwo:
  - Próba odczytu cudzych zasobów → 403/404

B. Decks (CRUD)
- Create deck
  - Stworzenie z minimalnymi wymaganymi polami → nowy deck w liście i w DB
- Update deck
  - Zmiana nazwy/ustawień → odzwierciedlenie w DB i UI
- Delete deck
  - Usunięcie → powiązane flashcardy cascade/archiwizacja — sprawdzić zachowanie migracji i DB
- Edge: tworzenie z duplikatem nazwy/znaki specjalne → walidacja

C. Flashcards (CRUD)
- Dodaj/Edytuj/Usuń flashcard → poprawność pól (question/answer), aktualizacja FSRS/metadata
- Bulk operations (jeśli dostępne) oraz import/export

D. Generowanie kart AI (generation-requests)
- Tworzenie requesta
  - Z wywołaniem OpenRouter → oczekiwanie na status: pending → processing → completed
- Brak połączenia do OpenRouter
  - Backend powinien zwrócić błąd lub retry; frontend powinien pokazać czytelny komunikat i opcję retrigger
- Akceptacja wygenerowanych kart
  - Endpoint accept (`pages/api/generation-requests/[requestId]/accept.ts`) → generowane flashcardy zapisywane dla użytkownika
- Bezpieczeństwo: tylko właściciel może zaakceptować request

E. Sesje nauki (study-sessions)
- Rozpoczęcie sesji: inicjalizacja, lista flashcardów, kolejność
- Review events: zapis odpowiedzi, aktualizacja powtórek (FSRS)
- Podsumowanie: podsumowanie sesji/score, zapis summary
- Integracja z backendem: review-events endpoint, summary endpoint

F. Dashboard / Overview
- Pobranie statystyk (today, progress)
- Wyświetlanie kart TodayStatsCard i QuickActions

G. UI / Komponenty krytyczne
- Renderowanie komponentów DashboardHeader, DeckOverviewItem, Loading/Error States
- Formularze: walidacja, focus management, dostępność

H. Middleware i routing
- Sprawdzenie protected routes: dostęp do stron wymagających auth (np. `/generate`) -> redirect do login
- Cookie / token handling

I. CI/CD i build
- build (`astro build`) w czystym środowisku -> brak błędów, linter/format checks
- Uruchamianie testów w GH Actions

## 5. Środowisko testowe
- Lokalne:
  - Node.js (wersja zgodna z `.nvmrc`)
  - Supabase lokalny lub testowy projekt z izolowaną DB (migrations uruchamiane)
  - Mock OpenRouter (MSW lub lokalny stub) do testów integracyjnych
  - ENV pliki: `.env.test` z testowymi kluczami i DB
- Staging:
  - Deploy z podobną konfiguracją jak produkcja (DigitalOcean / docker) z odizolowanym DB
  - Integracja z rzeczywistym OpenRouter do testów e2e manualnych i smoke (z limitami)
- CI:
  - GitHub Actions runner z cache zależności, uruchamiający testy jednostkowe, integracyjne i E2E (headless)
- Dane testowe:
  - Skrypty seedujące DB (migrations + seed) w `/supabase/migrations` lub dedykowane skrypty testowe
  - Testy powinny resetować DB przed grupą testów (transaction rollback / fixtures)

## 6. Narzędzia do testowania
- Unit / Integracja:
  - Vitest (TypeScript), React Testing Library, `@testing-library/react`
  - msw (Mock Service Worker) do mockowania API / OpenRouter
  - Sinon / Mocking utilities
- API:
  - Supertest (dla endpointów server-side), albo testy integracyjne uruchamiane bezpośrednio na kodzie
- E2E:
  - Playwright (zalecane) lub Cypress — testy login/register, CRUDe2e, generation flow
- Performance:
  - k6 (load tests) + Lighthouse (audits), WebPageTest
- Accessibility:
  - axe-core, jest-axe, Lighthouse
- Security:
  - nsp / snyk / dependency-check, oraz manualne sprawdzenia auth flows
- CI/CD:
  - GitHub Actions — workflow uruchamiający testy, build i deploy na staging
- Test management / raport:
  - JIRA / GitHub Issues + reporter z Playwright / Allure do raportów testów
- Lint / format:
  - ESLint, TypeScript compiler, Prettier — uruchamiane w CI

## 7. Harmonogram testów (przykładowy)
Zakładając sprint 2‑tygodniowy i gotowy feature branch:
- Dzień 0 (przed PR): developer uruchamia lokalne unit/integracyjne
- CI (on PR):
  - krok 1 (0–10 min): instalacja, lint, unit tests (fast)
  - krok 2 (10–25 min): integracyjne smoke (serwisy + mock Supabase)
  - krok 3 (25–50 min): E2E smoke (playwright headless, krytyczne ścieżki)
- Po akceptacji PR (merge → staging):
  - Nightly/full E2E + performance (na staging, noc)
- Sprint plan:
  - Tydzień 1: przygotowanie testów jednostkowych i integracyjnych dla nowych funkcji
  - Tydzień 2: pisanie/aktualizacja E2E, testy wydajnościowe, a11y
- Czas trwania testów do wdrożenia: zależnie od rozmiaru, zwykle 1–3 dni na pełny regression suite + 1 dzień performance/a11y

## 8. Kryteria akceptacji testów
- Unit tests: pokrycie krytycznej logiki ≥ 80% (dla modułów biznesowych), brak testów nieprzechodzących
- Integracyjne: wszystkie endpoints krytyczne (auth, decks, flashcards, generation, study-sessions) przechodzą w środowisku testowym
- E2E: wszystkie krytyczne ścieżki (auth, create deck, generate+accept, start study session) przechodzą w CI (smoke)
- Security: brak krytycznych usterek auth/ACL, brak exposure sekretów
- Performance: P95 latency API poniżej ustalonego progu (np. <500ms przy 50 RPS dla listDecks); strona główna Lighthouse Performance ≥ 80
- Accessibility: brak blokujących błędów a11y (axe: no critical violations)
- CI: każdy PR musi przejść testy automatyczne before merge

## 9. Role i odpowiedzialności
- Product Owner (PO)
  - Weryfikacja kryteriów akceptacji biznesowych, priorytetyzacja bugów
- QA Lead
  - Opracowanie i utrzymanie planu testów, priorytetyzacja testów, prowadzenie przeglądów testów
- QA Engineer / Tester
  - Implementacja i uruchamianie testów E2E, manualna weryfikacja przypadków złożonych, raportowanie błędów
- Developer
  - Pisanie testów jednostkowych/integracyjnych dla zmienionego kodu, naprawa bugów
- DevOps / SRE
  - Utrzymanie staging, CI/CD, środowisk testowych i segregacji danych
- Security Engineer (jeśli dostępny)
  - Weryfikacja podatności i testów bezpieczeństwa

## 10. Procedury raportowania błędów
- Narzędzie: GitHub Issues (zalecane) lub JIRA
- Szablon zgłoszenia błędu:
  - Tytuł: [SEVERITY] krótkie streszczenie (np. [P0] Nie działa akceptacja wygenerowanych kart)
  - Kroki reprodukcji: krok-po-kroku
  - Oczekiwane zachowanie
  - Rzeczywiste zachowanie
  - Środowisko: lokal / staging / production, wersja commit SHA, branch
  - Logi / stack trace / screenshoty / zapis sieci (Playwright trace)
  - Dodatkowe informacje: payload requests, DB state, wskazówki do debugowania
- Priorytety i SLA:
  - P0 — blokujące (brak major funkcji, bezpieczeństwo) — naprawa ASAP, hotfix
  - P1 — krytyczne, działa ale z poważną utratą funkcjonalności — naprawa w bieżącym sprincie
  - P2 — umiarkowane — zaplanować w backlogu
  - P3 — kosmetyczne/usability — niskie priorytety
- Etap zamknięcia błędu:
  - Reprodukcja → przypisanie → naprawa → testy dewelopera → testy QA → zamknięcie

## Dodatkowe rekomendacje i praktyki
- Mockowanie OpenRouter w większości testów; tylko ograniczone testy integracyjne na staging z rzeczywistym serwisem (koszty)
- W testach integracyjnych używać msw / stub serverów, a przy testach E2E uruchamiać DB z seedami
- Pamiętać o testowaniu migracji DB (rollback/forward) na staging
- Ustawić politykę testów w CI: każdy PR wymaga green CI
- Raportowanie coverage i test results do dashboardu (Allure / GitHub checks)
- Wprowadzić "test checklist" dla release (smoke, e2e, perf a11y)
- Dokumentować fixtures / seed data w repo
