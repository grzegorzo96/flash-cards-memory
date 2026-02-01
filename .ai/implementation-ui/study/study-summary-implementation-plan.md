# Plan implementacji widoku Podsumowanie sesji

## 1. Przeglad
Podsumowanie zakonczonej sesji: liczba kart, rozklad ocen, czas trwania.

## 2. Routing widoku
- Sciezka: `/study/:sessionId/summary`

## 3. Struktura komponentow
- `StudySummaryPage`
- `SummaryCard`
- `RatingsBreakdown`
- `ActionBar`
- `ErrorBanner`

## 4. Szczegoly komponentow
### StudySummaryPage
- Opis: Pobiera summary i prezentuje metryki.
- Typy: `StudySessionSummaryResponseDTO`.

### ActionBar
- Opis: CTA "Wroc do dashboardu", "Ucz sie dalej".

## 5. Typy
- `StudySessionSummaryResponseDTO` (`cards_reviewed`, `ratings`).

## 6. Zarzadzanie stanem
- `data`, `isLoading`, `error`.
- `useStudySummary(sessionId)`.

## 7. Integracja API
- `GET /api/study-sessions/{sessionId}/summary`.

## 8. Interakcje uzytkownika
- Powrot do dashboardu.
- Kontynuacja nauki (jesli sa kolejne karty).

## 9. Warunki i walidacja
- Brak (tylko wyswietlanie).

## 10. Obsluga bledow
- 404 -> komunikat i powrot.
- 500 -> `ErrorBanner` + retry.

## 11. Kroki implementacji
1. Dodaj strone `/study/:sessionId/summary`.
2. Pobierz summary i wyswietl metryki.
3. Dodaj CTA do nawigacji.
