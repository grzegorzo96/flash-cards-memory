# Plan implementacji widoku Dashboard

## 1. Przeglad
Dashboard to glowny ekran po wejsciu do aplikacji, pokazuje laczna liczbe kart na dzis oraz liste talii z licznikami. Zapewnia szybkie CTA do generowania fiszek i rozpoczecia nauki.

## 2. Routing widoku
- Sciezka: `/dashboard` (opcjonalnie `/` jako alias startowy)

## 3. Struktura komponentow
- `DashboardPage`
- `DashboardHeader`
- `TodayStatsCard`
- `DecksOverviewList`
- `DeckOverviewItem`
- `QuickActions`
- `LoadingState`
- `EmptyState`
- `ErrorBanner`

## 4. Szczegoly komponentow
### DashboardPage
- Opis: Strona Astro + root React, pobiera dane i sklada widok.
- Glowne elementy: `main`, sekcje statystyk i listy talii.
- Interakcje: brak bezposrednich.
- Walidacja: brak.
- Typy: `DashboardResponseDTO`.
- Propsy: brak.

### DashboardHeader
- Opis: Naglowek z tytulem i opisem.
- Glowne elementy: `h1`, tekst pomocniczy.
- Interakcje: brak.
- Walidacja: brak.
- Typy: brak.
- Propsy: brak.

### TodayStatsCard
- Opis: Karta z liczba "Karty na dzis".
- Glowne elementy: licznik, etykieta.
- Interakcje: brak.
- Walidacja: brak.
- Typy: `DashboardResponseDTO`.
- Propsy: `dueTodayTotal`.

### DecksOverviewList
- Opis: Lista talii z countami i CTA do nauki.
- Glowne elementy: `ul`, `DeckOverviewItem`, `EmptyState`.
- Interakcje: klik w talie, klik "Rozpocznij nauke".
- Walidacja: brak.
- Typy: `DashboardDeckDTO[]`.
- Propsy: `decks`.

### DeckOverviewItem
- Opis: Pojedyncza talia w liscie.
- Glowne elementy: nazwa, `card_count`, `due_today_count`, przycisk.
- Interakcje: `onOpen`, `onStartStudy`.
- Walidacja: brak.
- Typy: `DashboardDeckDTO`.
- Propsy: `deck`, `onOpen`, `onStartStudy`.

### QuickActions
- Opis: CTA "Utworz fiszki".
- Glowne elementy: przyciski/linki.
- Interakcje: nawigacja do `/generate/setup`.
- Walidacja: brak.
- Typy: brak.
- Propsy: brak.

### ErrorBanner / LoadingState / EmptyState
- Opis: Stany pomocnicze.
- Interakcje: `retry` dla ErrorBanner.
- Propsy: `message`, `onRetry`.

## 5. Typy
- `DashboardResponseDTO`:
  - `due_today_total: number`
  - `decks: DashboardDeckDTO[]`
- `DashboardDeckDTO`:
  - `id`, `name`, `card_count`, `due_today_count`

## 6. Zarzadzanie stanem
- `isLoading`, `error`, `data`.
- Pobranie danych w `useDashboardOverview()`.

## 7. Integracja API
- `GET /api/dashboard` -> `DashboardResponseDTO`.
- Po mutacjach w innych widokach: odswiezyc dane (invalidacja cache).

## 8. Interakcje uzytkownika
- Klikniecie w talie -> `/decks/:deckId`.
- Klikniecie "Rozpocznij nauke" -> POST `/api/study-sessions` i przejscie do `/study/:sessionId`.
- Klikniecie "Utworz fiszki" -> `/generate/setup`.

## 9. Warunki i walidacja
- Brak walidacji formularzy.
- Pusta lista: `EmptyState` z CTA do utworzenia fiszek.

## 10. Obsluga bledow
- Blad sieci/API -> `ErrorBanner` + przycisk ponowienia.
- Brak danych -> `EmptyState`.

## 11. Kroki implementacji
1. Dodaj strone `/dashboard` i root React.
2. Zaimplementuj `useDashboardOverview()` (GET /api/dashboard).
3. Zbuduj `TodayStatsCard` i `DecksOverviewList`.
4. Dodaj CTA i nawigacje do generowania oraz nauki.
5. Dodaj stany loading/empty/error.
