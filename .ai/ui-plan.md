# Architektura UI dla FlashCardsMemory

## 1. Przegląd struktury UI

Architektura UI opiera sie na trzech glownych obszarach: dashboard (start i przeglad), zarzadzanie taliami/fiszkami oraz osobny, wieloetapowy flow generowania AI zakonczony akceptacja do talii. Dodatkowo wystepuje pelnoekranowy Focus Mode dla sesji nauki. Nawigacja zapewnia szybki dostep do Dashboardu, Moich talii i utworzenia fiszek, a wszystkie listy korzystaja z paginacji limit/offset. Po mutacjach dane sa odswiezane przez GET `/api/dashboard` i uniewaznienie cache list. UI jest mobile-first dla krytycznych flow (generowanie, sesja nauki), z naciskiem na czytelne etykiety, kontrast AA i widoczne focus states.

## 2. Lista widokow

### 2.1 Dashboard
- Nazwa widoku: Dashboard
- Sciezka widoku: `/dashboard` (lub `/` jako start)
- Glowny cel: przeglad stanu nauki i szybkie akcje
- Kluczowe informacje do wyswietlenia: liczba kart na dzisiaj, lista talii z liczba kart i due_today_count
- Kluczowe komponenty widoku: karta statystyk "Karty na dzis", lista talii, akcje "Utworz fiszki", "Rozpocznij nauke"
- UX, dostepnosc i wzgledy bezpieczenstwa: czytelne CTA, kontrast AA, brak komunikatu o ograniczeniach trybu gosc; przygotowane miejsce na przyszle konto/profil

### 2.2 Moje talie (lista)
- Nazwa widoku: Lista talii
- Sciezka widoku: `/decks`
- Glowny cel: przeglad i zarzadzanie taliami
- Kluczowe informacje do wyswietlenia: nazwa, opis, liczba fiszek, karty do powtorki dzis
- Kluczowe komponenty widoku: tabela/lista z sortowaniem, paginacja, pusta lista z CTA, przyciski "Edytuj", "Usun", "Rozpocznij nauke"
- UX, dostepnosc i wzgledy bezpieczenstwa: potwierdzenie usuniecia z ostrzezeniem o utracie danych, fokus i etykiety formularzy, ochrona przed przypadkowym usunieciem

### 2.3 Szczegoly talii (lista fiszek)
- Nazwa widoku: Talia - lista fiszek
- Sciezka widoku: `/decks/:deckId`
- Glowny cel: przeglad fiszek i szybkie operacje
- Kluczowe informacje do wyswietlenia: lista fiszek (pytanie + fragment odpowiedzi), liczba wszystkich fiszek
- Kluczowe komponenty widoku: wyszukiwarka (q), lista z paginacja, przyciski "Edytuj", "Usun", szybki podglad w panelu bocznym/modalu, CTA "Dodaj fiszke"
- UX, dostepnosc i wzgledy bezpieczenstwa: zachowanie kontekstu po powrocie z edycji, potwierdzenie usuniecia, czytelne stany pustej listy

### 2.4 Fiszka - podglad/edycja
- Nazwa widoku: Fiszka szczegoly
- Sciezka widoku: `/flashcards/:flashcardId`
- Glowny cel: szczegoly i edycja pojedynczej fiszki
- Kluczowe informacje do wyswietlenia: pelne pytanie i odpowiedz, metadane (zrodlo, daty)
- Kluczowe komponenty widoku: formularz edycji z formatowaniem Markdown, przyciski "Zapisz", "Anuluj", "Usun"
- UX, dostepnosc i wzgledy bezpieczenstwa: walidacja pol, zachowanie historii powtorek, potwierdzenie usuniecia

### 2.5 Tworzenie/edycja talii
- Nazwa widoku: Formularz talii
- Sciezka widoku: `/decks/new`, `/decks/:deckId/edit`
- Glowny cel: tworzenie lub edycja talii
- Kluczowe informacje do wyswietlenia: nazwa, opis
- Kluczowe komponenty widoku: formularz z walidacja, komunikaty o bledach i sukcesie
- UX, dostepnosc i wzgledy bezpieczenstwa: walidacja unikalnosci nazwy, jasne komunikaty o bledach, focus states

### 2.6 Tworzenie fiszki manualnej
- Nazwa widoku: Nowa fiszka
- Sciezka widoku: `/flashcards/new`
- Glowny cel: reczne tworzenie fiszki
- Kluczowe informacje do wyswietlenia: pytanie, odpowiedz, wybor talii
- Kluczowe komponenty widoku: formularz z przyciskami formatowania, walidacja, wybierak talii
- UX, dostepnosc i wzgledy bezpieczenstwa: podpowiedzi formatowania, zachowanie danych przy bledach

### 2.7 Generowanie AI - ustawienia startowe
- Nazwa widoku: Generowanie - ustawienia startowe
- Sciezka widoku: `/generate/setup`
- Glowny cel: szybkie ustawienia startowe
- Kluczowe informacje do wyswietlenia: domyslna dziedzina (mapowana na `domain` w API), informacja o dalszych krokach
- Kluczowe komponenty widoku: wybor domeny, przycisk kontynuacji
- UX, dostepnosc i wzgledy bezpieczenstwa: prosty 1-krokowy ekran, czytelne etykiety, brak komunikatu o trybie gosc

### 2.8 Generowanie AI - wprowadzanie tekstu
- Nazwa widoku: Generowanie - wprowadzanie tekstu
- Sciezka widoku: `/generate/input`
- Glowny cel: wklejenie tekstu i konfiguracja jezyka
- Kluczowe informacje do wyswietlenia: licznik znakow, limit 5000, wybor jezyka docelowego
- Kluczowe komponenty widoku: pole tekstowe z tooltipami, dropdown domeny, dropdown jezyka, przycisk "Generuj"
- UX, dostepnosc i wzgledy bezpieczenstwa: walidacja min 100 znakow, komunikaty bledu bez utraty danych, focus states

### 2.9 Generowanie AI - w toku
- Nazwa widoku: Generowanie w toku
- Sciezka widoku: `/generate/progress`
- Glowny cel: informacja o postepie i kontrola anulowania
- Kluczowe informacje do wyswietlenia: status, przewidywany czas, opcja anulowania
- Kluczowe komponenty widoku: pelnoekranowy ekran ladowania, przycisk "Anuluj"
- UX, dostepnosc i wzgledy bezpieczenstwa: czytelne komunikaty, bez utraty danych po anulowaniu

### 2.10 Generowanie AI - podglad i edycja
- Nazwa widoku: Generowanie - podglad fiszek
- Sciezka widoku: `/generate/preview`
- Glowny cel: weryfikacja, edycja i akceptacja fiszek
- Kluczowe informacje do wyswietlenia: lista fiszek, licznik, instrukcje regeneracji
- Kluczowe komponenty widoku: lista z edycja inline/modal, usuwanie, dodawanie manualnej fiszki, dropdown talii, inline "Utworz talie", przyciski "Zapisz fiszki", "Generuj ponownie", "Wstecz", "Anuluj"
- UX, dostepnosc i wzgledy bezpieczenstwa: zawsze widoczny przycisk regeneracji, zachowanie stanu przy bledach, kontrast i czytelne etykiety

### 2.11 Generowanie AI - limit 429 / bledy
- Nazwa widoku: Generowanie - blad
- Sciezka widoku: `/generate/error`
- Glowny cel: obsluga timeout/429 i innych bledow
- Kluczowe informacje do wyswietlenia: komunikat bledu, licznik odliczania dla 429
- Kluczowe komponenty widoku: CTA "Sprobuj ponownie za chwile", zachowanie wprowadzonego tekstu
- UX, dostepnosc i wzgledy bezpieczenstwa: bez utraty danych, jasne komunikaty, brak technicznych szczegolow

### 2.12 Focus Mode - sesja nauki
- Nazwa widoku: Focus Mode
- Sciezka widoku: `/study/:sessionId`
- Glowny cel: nauka bez rozpraszaczy
- Kluczowe informacje do wyswietlenia: pytanie, odpowiedz (po odsłonieciu), numer karty, liczba kart
- Kluczowe komponenty widoku: przycisk "Pokaz odpowiedz", panel ocen 1-4 z czasami do powtorki, skróty klawiszowe, przycisk "Zakoncz sesje"
- UX, dostepnosc i wzgledy bezpieczenstwa: pelna obsluga dotyku, widoczne przyciski (nie tylko skróty), focus states

### 2.13 Podsumowanie sesji
- Nazwa widoku: Podsumowanie sesji
- Sciezka widoku: `/study/:sessionId/summary`
- Glowny cel: podsumowanie wynikow sesji
- Kluczowe informacje do wyswietlenia: liczba powtorek, rozklad ocen, czas trwania
- Kluczowe komponenty widoku: karta podsumowania, CTA "Wroc do dashboardu", "Ucz sie dalej"
- UX, dostepnosc i wzgledy bezpieczenstwa: czytelny układ, informacja o zapisanych postepach

### 2.14 Auth (pod przyszle logowanie)
- Nazwa widoku: Logowanie/Rejestracja/Reset hasla
- Sciezka widoku: `/login`, `/register`, `/reset-password`
- Glowny cel: przygotowanie UI pod przyszla autoryzacje
- Kluczowe informacje do wyswietlenia: formularze, komunikaty
- Kluczowe komponenty widoku: pola email/haslo, walidacja, linki
- UX, dostepnosc i wzgledy bezpieczenstwa: walidacja, komunikaty, placeholdery bez aktywnego wymuszenia w MVP

## 3. Mapa podrozy uzytkownika

1. Dashboard → wybór: "Utworz fiszki" lub "Moje talie".
2. Generowanie: `/generate/setup` → `/generate/input` → `/generate/progress` → `/generate/preview`.
3. W podgladzie: edycja/usuwanie/dodawanie fiszek → wybor lub utworzenie talii inline → "Zapisz fiszki".
4. Po akceptacji: przekierowanie do `/decks/:deckId` lub `/dashboard`.
5. Sesja nauki: z dashboardu lub listy talii → POST `/api/study-sessions` → `/study/:sessionId` → `/study/:sessionId/summary`.
6. Zarzadzanie fiszkami: `/decks/:deckId` → szybki podglad → opcjonalnie `/flashcards/:flashcardId` edycja.
7. Bledy generowania: w kazdym kroku generowania widoczny stan bledu z "Sprobuj ponownie" bez utraty danych.

## 4. Uklad i struktura nawigacji

- Nawigacja glowna (top bar): Dashboard, Moje talie, Utworz fiszki.
- Sekcyjny naglowek z jedna akcja glowna na widokach list i szczegolow.
- Breadcrumbs tylko tam, gdzie pomaga (np. Talia → Fiszka).
- W Focus Mode brak globalnej nawigacji, tylko minimalne akcje sesji.
- Mobile: menu hamburger, CTA pozostaja widoczne w stopce/toolbarze.

## 5. Kluczowe komponenty

- Globalny układ aplikacji z naglowkiem i sekcyjnym CTA.
- Karty statystyk (dashboard), lista talii, lista fiszek z paginacja i wyszukiwarka.
- Formularz fiszki z obsluga podstawowego Markdown.
- Wieloetapowy pasek krokow dla flow generowania (Wstecz/Anuluj/Zapisz).
- Panel podgladu fiszki w modalu/panelu bocznym.
- Pelnoekranowy ekran generowania i ekran bledow z odliczaniem (429).
- Focus Mode: przycisk "Pokaz odpowiedz" i panel ocen 1-4.
