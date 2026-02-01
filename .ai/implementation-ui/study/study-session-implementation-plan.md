# Plan implementacji widoku Focus Mode (sesja nauki)

## 1. Przeglad
Pelnoekranowy widok nauki z karta, odslnieciem odpowiedzi i ocenami 1-4.

## 2. Routing widoku
- Sciezka: `/study/:sessionId`

## 3. Struktura komponentow
- `StudySessionPage`
- `StudyHeader`
- `FlashcardPrompt`
- `ShowAnswerButton`
- `AnswerPanel`
- `RatingPanel`
- `KeyboardHints`
- `EndSessionButton`
- `ErrorBanner`

## 4. Szczegoly komponentow
### StudySessionPage
- Opis: Zarzadza lista kart, indeksem i ratingami.
- Typy: `StartStudySessionResponseDTO`, `CreateReviewEventCommand`.

### FlashcardPrompt / AnswerPanel
- Opis: Pytanie i odpowiedz, odpowiedz ukryta do odslony.

### RatingPanel
- Opis: Przyciski 1-4 z opisami i czasem do powtorki.
- Walidacja: `rating` 1-4.

### KeyboardHints
- Opis: Skróty: spacja, 1-4.

## 5. Typy
- `StartStudySessionResponseDTO` (`id`, `status`, `cards`).
- `StudySessionCardDTO` (`id`, `question`, `answer`).
- `CreateReviewEventCommand` (`flashcard_id`, `rating`).
- `CreateReviewEventResponseDTO`.

## 6. Zarzadzanie stanem
- `cards`, `currentIndex`, `isAnswerVisible`, `isSubmitting`.
- `useStudySession(sessionId)` do zarzadzania i wysylki ocen.

## 7. Integracja API
- Start sesji dzieje sie w poprzednim widoku (POST /api/study-sessions).
- `POST /api/study-sessions/{sessionId}/review-events` po ocenie.
- `PATCH /api/study-sessions/{sessionId}` po zakonczeniu (status).

## 8. Interakcje uzytkownika
- Odslniecie odpowiedzi (przycisk lub spacja).
- Ocena 1-4 (przyciski lub klawisze).
- Zakonczenie sesji.

## 9. Warunki i walidacja
- Ocena tylko po odslonieciu odpowiedzi.
- `rating` 1-4.

## 10. Obsluga bledow
- Blad zapisu oceny -> komunikat i retry.
- Brak kart -> komunikat i powrot.

## 11. Kroki implementacji
1. Dodaj strone `/study/:sessionId`.
2. Zaimplementuj odslanianie odpowiedzi.
3. Dodaj obsluge ocen i skrótow.
4. Podlacz POST review-event i PATCH status.
