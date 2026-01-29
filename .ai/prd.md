# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

10xCards to webowa aplikacja do tworzenia i nauki z fiszek edukacyjnych, wykorzystująca sztuczną inteligencję do automatycznego generowania wysokiej jakości materiałów do nauki. Aplikacja integruje model GPT-5.2 do generowania fiszek na podstawie tekstu źródłowego oraz zaawansowany algorytm powtórek FSRS (Free Spaced Repetition Scheduler), aby zapewnić efektywną naukę metodą spaced repetition.

Główne założenia produktu:
- Automatyczne generowanie fiszek AI z wklejonego tekstu (do 5000 znaków)
- Wybór dziedziny wiedzy wpływający na jakość generowanych fiszek
- System talii (decks) do organizacji materiałów
- Sesje nauki z 4-stopniową oceną 
- Pełna historia powtórek dla optymalnego działania algorytmu FSRS
- Analityka jakości generatów i zachowań użytkowników (PostHog)

Stack technologiczny:
- Frontend: Astro z komponentami React
- Backend/Auth/Baza danych: Supabase
- AI: GPT-5.2 (wersja darmowa)
- Analityka: PostHog

## 2. Problem użytkownika

Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest procesem czasochłonnym i żmudnym. Użytkownicy, którzy chcą korzystać z efektywnej metody nauki jaką jest spaced repetition, często rezygnują z niej ze względu na barierę wejścia związaną z koniecznością samodzielnego przygotowania materiałów.

Kluczowe problemy:
- Tworzenie fiszek wymaga znacznego nakładu czasu, który mógłby być przeznaczony na właściwą naukę
- Trudność w formułowaniu pytań i odpowiedzi w sposób optymalny dla zapamiętywania
- Brak motywacji do systematycznego tworzenia fiszek z nowych materiałów
- Niespójność jakości fiszek tworzonych ręcznie

10xCards rozwiązuje te problemy poprzez:
- Automatyzację procesu tworzenia fiszek z wykorzystaniem AI
- Kontekstowe generowanie fiszek dostosowane do dziedziny wiedzy
- Szybki przepływ pracy: wklej tekst, zweryfikuj, zapisz, ucz się
- Algorytm FSRS optymalizujący harmonogram powtórek

## 3. Wymagania funkcjonalne

### 3.1 System uwierzytelniania i kont użytkowników
- Rejestracja nowych użytkowników (email + hasło)
- Logowanie i wylogowanie
- Zarządzanie sesją użytkownika
- Bezpieczne przechowywanie danych użytkownika w Supabase

### 3.2 Generowanie fiszek AI
- Pole tekstowe do wklejenia tekstu źródłowego (limit 5000 znaków)
- Dropdown wyboru dziedziny wiedzy z predefiniowaną listą kategorii:
  - Języki obce
  - Medycyna
  - Prawo
  - Informatyka
  - Historia
  - Biologia
  - Chemia
  - Fizyka
  - Matematyka
  - Ekonomia
  - Geografia
  - Inne
- Automatyczne wykrywanie języka tekstu źródłowego i generowanie fiszek w tym samym języku
- Możliwość ręcznego wskazania języka docelowego fiszek
- Przechowywanie oryginalnego tekstu źródłowego w bazie danych
- Tooltips/przykłady przy polu tekstowym edukujące o jakości inputu

### 3.3 Widok weryfikacji fiszek (Preview & Bulk Edit)
- Wyświetlenie wszystkich wygenerowanych fiszek przed zapisem
- Możliwość edycji pojedynczej fiszki (pytanie i odpowiedź)
- Możliwość usunięcia pojedynczej fiszki
- Możliwość ręcznego dodania nowej fiszki
- Przypisanie fiszek do wybranej talii
- Zapis zaakceptowanych fiszek do bazy danych
- Oznaczanie fiszek flagą is_accepted dla celów analitycznych

### 3.4 Manualne tworzenie fiszek
- Formularz tworzenia pojedynczej fiszki (pytanie + odpowiedź)
- Podstawowe formatowanie Markdown (pogrubienie, kursywa)
- Przypisanie do wybranej talii

### 3.5 Zarządzanie taliami (Decks)
- Tworzenie nowych talii z nazwą i opcjonalnym opisem
- Edycja nazwy i opisu talii
- Usuwanie talii (z potwierdzeniem i usunięciem powiązanych fiszek)
- Lista wszystkich talii użytkownika na dashboardzie
- Wyświetlanie liczby kart w każdej talii
- Wyświetlanie liczby kart do powtórki danego dnia dla każdej talii

### 3.6 Przeglądanie i zarządzanie fiszkami
- Lista fiszek w ramach wybranej talii
- Widok pojedynczej fiszki (pytanie + odpowiedź)
- Edycja istniejącej fiszki
- Usuwanie fiszki (z potwierdzeniem)
- Wyszukiwanie fiszek w ramach talii

### 3.7 Sesja nauki (Study Session)
- Focus Mode - minimalistyczny interfejs bez rozpraszaczy
- Wyświetlanie pytania z możliwością odsłonięcia odpowiedzi
- 4-stopniowa skala oceny: 1 (Powtórz), 2 (Trudne), 3 (Dobrze), 4 (Łatwe)
- Skróty klawiszowe (1, 2, 3, 4) do szybkiej oceny
- Skrót klawiszowy (spacja) do odsłonięcia odpowiedzi
- Algorytm FSRS obliczający następny termin powtórki
- Logowanie pełnej historii powtórek w bazie danych
- Podsumowanie sesji po zakończeniu (liczba kart, rozkład ocen)

### 3.8 Dashboard użytkownika
- Wizualny wskaźnik "Karty na dziś" - łączna liczba kart do powtórki
- Lista talii z informacją o kartach do powtórki
- Szybki dostęp do tworzenia nowych fiszek
- Szybki dostęp do rozpoczęcia sesji nauki

### 3.9 Obsługa błędów i edge cases
- Komunikat o błędzie gdy generowanie AI trwa zbyt długo (timeout)
- Komunikat o błędzie gdy API GPT-5.2 jest niedostępne
- Możliwość ponowienia próby generowania
- Walidacja długości tekstu źródłowego (min/max)
- Walidacja formularzy (wymagane pola, format email)

### 3.10 Analityka (PostHog)
- Śledzenie wskaźnika akceptacji fiszek AI
- Korelacja jakości generatów z długością tekstu źródłowego
- Logowanie instrukcji regeneracji jako feedback loop
- Monitorowanie retencji użytkowników
- Śledzenie proporcji fiszek AI vs manualnych

## 4. Granice produktu

### 4.1 W zakresie MVP
- Generowanie fiszek przez AI na podstawie wklejonego tekstu
- Manualne tworzenie, edycja i usuwanie fiszek
- System kont użytkowników z uwierzytelnianiem
- Organizacja fiszek w talie
- Sesje nauki z algorytmem FSRS
- Podstawowa analityka użytkowania
- Responsywny interfejs webowy

### 4.2 Poza zakresem MVP
- Własny, zaawansowany algorytm powtórek (rozszerzenie FSRS)
- Import wielu formatów plików (PDF, DOCX, EPUB, itp.)
- Współdzielenie zestawów fiszek między użytkownikami
- Aplikacje mobilne natywne (iOS, Android)
- Funkcja eksportu danych (CSV)
- Powiadomienia push w przeglądarce
- Publiczna biblioteka talii
- Tryb offline
- Gamifikacja (punkty, odznaki, streak)
- Zaawansowany edytor z obsługą obrazów i dźwięku
- Funkcje łączenia/dzielenia fiszek w widoku edycji
- API publiczne dla integracji zewnętrznych

## 5. Historyjki użytkowników

### Uwierzytelnianie i zarządzanie kontem

US-001
Tytuł: Rejestracja nowego użytkownika
Opis: Jako nowy użytkownik chcę założyć konto w aplikacji, aby móc zapisywać swoje fiszki i śledzić postępy w nauce.
Kryteria akceptacji:
- Formularz rejestracji zawiera pola: email, hasło, potwierdzenie hasła
- System waliduje poprawność formatu email
- System wymaga hasła o minimalnej długości 8 znaków
- System sprawdza zgodność hasła i jego potwierdzenia
- Po pomyślnej rejestracji użytkownik otrzymuje email weryfikacyjny
- System wyświetla komunikat o konieczności weryfikacji email
- Próba rejestracji z istniejącym emailem wyświetla odpowiedni błąd

US-002
Tytuł: Logowanie do systemu
Opis: Jako zarejestrowany użytkownik chcę zalogować się do aplikacji, aby uzyskać dostęp do moich fiszek i talii.
Kryteria akceptacji:
- Formularz logowania zawiera pola: email i hasło
- Po poprawnym logowaniu użytkownik jest przekierowany na dashboard
- Niepoprawne dane logowania wyświetlają komunikat o błędzie
- Sesja użytkownika jest utrzymywana między odświeżeniami strony
- Istnieje link do formularza rejestracji dla nowych użytkowników
- Istnieje link do resetowania hasła

US-003
Tytuł: Wylogowanie z systemu
Opis: Jako zalogowany użytkownik chcę się wylogować, aby zabezpieczyć swoje konto.
Kryteria akceptacji:
- Przycisk wylogowania jest widoczny w nawigacji dla zalogowanych użytkowników
- Po wylogowaniu użytkownik jest przekierowany na stronę logowania
- Sesja użytkownika jest prawidłowo zakończona
- Próba dostępu do chronionych stron przekierowuje na logowanie

US-004
Tytuł: Resetowanie hasła
Opis: Jako użytkownik, który zapomniał hasła, chcę je zresetować, aby odzyskać dostęp do konta.
Kryteria akceptacji:
- Formularz resetowania hasła wymaga podania adresu email
- System wysyła link do resetowania hasła na podany email
- Link do resetowania jest ważny przez 24 godziny
- Po kliknięciu w link użytkownik może ustawić nowe hasło
- System potwierdza pomyślną zmianę hasła

### Generowanie fiszek AI

US-005
Tytuł: Generowanie fiszek z tekstu źródłowego
Opis: Jako użytkownik chcę wkleić tekst z podręcznika i automatycznie wygenerować z niego fiszki, aby zaoszczędzić czas na tworzeniu materiałów do nauki.
Kryteria akceptacji:
- Pole tekstowe akceptuje tekst do 5000 znaków
- Licznik znaków pokazuje aktualną liczbę i limit
- Przycisk generowania jest aktywny tylko gdy tekst ma minimalną długość (100 znaków)
- Po kliknięciu przycisku wyświetlany jest wskaźnik ładowania
- System generuje fiszki w formacie pytanie-odpowiedź
- Wygenerowane fiszki są wyświetlane w widoku podglądu
- Oryginalny tekst źródłowy jest zapisywany w bazie danych

US-006
Tytuł: Wybór dziedziny wiedzy przed generowaniem
Opis: Jako użytkownik chcę wybrać dziedzinę wiedzy przed generowaniem fiszek, aby AI lepiej dostosowała format i terminologię.
Kryteria akceptacji:
- Dropdown z listą dziedzin jest widoczny nad polem tekstowym
- Lista zawiera predefiniowane kategorie (Języki obce, Medycyna, Prawo, Informatyka, Historia, Biologia, Chemia, Fizyka, Matematyka, Ekonomia, Geografia, Inne)
- Wybrana dziedzina wpływa na prompt systemowy AI
- Domyślnie wybrana jest opcja "Inne"
- Wybór dziedziny jest zapisywany wraz z wygenerowanymi fiszkami

US-007
Tytuł: Automatyczne wykrywanie języka fiszek
Opis: Jako użytkownik chcę, aby fiszki były generowane w tym samym języku co tekst źródłowy, bez konieczności ręcznego ustawiania.
Kryteria akceptacji:
- System automatycznie wykrywa język tekstu źródłowego
- Fiszki są generowane w wykrytym języku
- Użytkownik może nadpisać automatyczny wybór języka
- Obsługiwane języki: polski, angielski, niemiecki, hiszpański, francuski

US-008
Tytuł: Obsługa błędów generowania AI
Opis: Jako użytkownik chcę otrzymać jasny komunikat gdy generowanie fiszek się nie powiedzie, abym wiedział co robić dalej.
Kryteria akceptacji:
- Timeout generowania wynosi 60 sekund
- Po przekroczeniu timeout wyświetlany jest komunikat o błędzie
- Komunikat o niedostępności API jest zrozumiały dla użytkownika
- Przycisk "Spróbuj ponownie" pozwala na ponowienie próby
- Tekst źródłowy nie jest tracony po błędzie

US-009
Tytuł: Edukacyjne wskazówki przy polu tekstowym
Opis: Jako nowy użytkownik chcę zobaczyć wskazówki jak przygotować dobry tekst źródłowy, aby uzyskać lepszej jakości fiszki.
Kryteria akceptacji:
- Tooltip lub tekst pomocniczy jest widoczny przy polu tekstowym
- Wskazówki zawierają przykłady dobrego tekstu źródłowego
- Wskazówki informują o optymalnej długości tekstu
- Wskazówki sugerują usunięcie zbędnych elementów (nagłówki, numery stron)

### Weryfikacja i edycja fiszek

US-010
Tytuł: Podgląd wygenerowanych fiszek przed zapisem
Opis: Jako użytkownik chcę przejrzeć wszystkie wygenerowane fiszki przed ich zapisaniem, aby upewnić się o ich jakości.
Kryteria akceptacji:
- Wszystkie wygenerowane fiszki są wyświetlane w formie listy
- Każda fiszka pokazuje pytanie i odpowiedź
- Widoczna jest łączna liczba wygenerowanych fiszek
- Użytkownik może przewijać listę fiszek
- Przyciski akcji są widoczne dla każdej fiszki

US-011
Tytuł: Edycja pojedynczej fiszki w widoku podglądu
Opis: Jako użytkownik chcę edytować wygenerowaną fiszkę przed zapisem, aby poprawić ewentualne błędy AI.
Kryteria akceptacji:
- Przycisk edycji jest widoczny przy każdej fiszce
- Kliknięcie otwiera tryb edycji inline lub modal
- Można edytować zarówno pytanie jak i odpowiedź
- Przycisk "Zapisz zmiany" potwierdza edycję
- Przycisk "Anuluj" przywraca oryginalną wersję
- Edytowana fiszka jest oznaczana jako zmodyfikowana

US-012
Tytuł: Usuwanie fiszki w widoku podglądu
Opis: Jako użytkownik chcę usunąć niepotrzebną fiszkę z listy wygenerowanych, aby zapisać tylko wartościowe materiały.
Kryteria akceptacji:
- Przycisk usunięcia jest widoczny przy każdej fiszce
- Usunięcie nie wymaga dodatkowego potwierdzenia w widoku podglądu
- Usunięta fiszka znika z listy
- Licznik fiszek jest aktualizowany
- Można usunąć wszystkie fiszki

US-013
Tytuł: Ręczne dodanie fiszki w widoku podglądu
Opis: Jako użytkownik chcę dodać własną fiszkę do wygenerowanego zestawu, aby uzupełnić brakujące informacje.
Kryteria akceptacji:
- Przycisk "Dodaj fiszkę" jest widoczny w widoku podglądu
- Formularz zawiera pola na pytanie i odpowiedź
- Nowa fiszka pojawia się na liście po dodaniu
- Ręcznie dodana fiszka jest oznaczana jako manualna (nie AI)

US-014
Tytuł: Zatwierdzenie i zapis fiszek do talii
Opis: Jako użytkownik chcę zapisać zaakceptowane fiszki do wybranej talii, aby móc później się z nich uczyć.
Kryteria akceptacji:
- Dropdown wyboru talii jest widoczny przed zapisem
- Można wybrać istniejącą talię lub utworzyć nową
- Przycisk "Zapisz fiszki" zapisuje wszystkie fiszki z listy
- System wyświetla potwierdzenie zapisu z liczbą zapisanych fiszek
- Fiszki są oznaczane flagą is_accepted
- Użytkownik jest przekierowany do widoku talii lub dashboardu

### Manualne tworzenie fiszek

US-015
Tytuł: Tworzenie pojedynczej fiszki ręcznie
Opis: Jako użytkownik chcę utworzyć fiszkę ręcznie, gdy AI nie jest potrzebne lub tekst źródłowy nie jest dostępny.
Kryteria akceptacji:
- Formularz zawiera pola: pytanie, odpowiedź, wybór talii
- Pola obsługują podstawowe formatowanie Markdown (pogrubienie, kursywa)
- Walidacja wymaga wypełnienia pytania i odpowiedzi
- Po zapisie fiszka jest dodawana do wybranej talii
- System potwierdza pomyślne utworzenie fiszki
- Fiszka jest oznaczana jako utworzona ręcznie (nie przez AI)

US-016
Tytuł: Formatowanie tekstu w fiszkach
Opis: Jako użytkownik chcę użyć podstawowego formatowania w treści fiszek, aby wyróżnić kluczowe informacje.
Kryteria akceptacji:
- Dostępne formatowanie: pogrubienie (Ctrl+B), kursywa (Ctrl+I)
- Przyciski formatowania są widoczne nad polem tekstowym
- Formatowanie jest widoczne w podglądzie fiszki
- Formatowanie jest zachowywane po zapisie

### Zarządzanie taliami

US-017
Tytuł: Tworzenie nowej talii
Opis: Jako użytkownik chcę utworzyć nową talię, aby organizować fiszki tematycznie.
Kryteria akceptacji:
- Formularz zawiera pola: nazwa talii (wymagane), opis (opcjonalny)
- Nazwa talii musi być unikalna w ramach konta użytkownika
- System waliduje minimalną długość nazwy (3 znaki)
- Po utworzeniu talia pojawia się na liście na dashboardzie
- System potwierdza pomyślne utworzenie talii

US-018
Tytuł: Edycja talii
Opis: Jako użytkownik chcę edytować nazwę i opis talii, aby lepiej ją opisać.
Kryteria akceptacji:
- Przycisk edycji jest dostępny dla każdej talii
- Można zmienić nazwę i opis talii
- Zmiana nazwy wymaga zachowania unikalności
- System potwierdza zapisanie zmian

US-019
Tytuł: Usuwanie talii
Opis: Jako użytkownik chcę usunąć talię, której już nie potrzebuję.
Kryteria akceptacji:
- Przycisk usunięcia jest dostępny dla każdej talii
- System wyświetla ostrzeżenie o usunięciu wszystkich fiszek w talii
- Wymagane jest potwierdzenie usunięcia (np. wpisanie nazwy talii)
- Po usunięciu talia i wszystkie jej fiszki są trwale usuwane
- System potwierdza pomyślne usunięcie

US-020
Tytuł: Przeglądanie listy talii
Opis: Jako użytkownik chcę widzieć wszystkie moje talie na dashboardzie, aby szybko wybrać materiał do nauki.
Kryteria akceptacji:
- Lista talii jest wyświetlana na dashboardzie
- Każda talia pokazuje: nazwę, liczbę fiszek, liczbę kart do powtórki dziś
- Talie można sortować (alfabetycznie, po dacie utworzenia, po liczbie kart do powtórki)
- Kliknięcie w talię otwiera jej szczegóły
- Pusta lista wyświetla zachętę do utworzenia pierwszej talii

### Zarządzanie fiszkami

US-021
Tytuł: Przeglądanie fiszek w talii
Opis: Jako użytkownik chcę przeglądać wszystkie fiszki w wybranej talii, aby sprawdzić ich zawartość.
Kryteria akceptacji:
- Lista fiszek wyświetla pytanie i początek odpowiedzi
- Fiszki można przewijać lub paginować
- Kliknięcie w fiszkę pokazuje pełną treść pytania i odpowiedzi
- Widoczna jest łączna liczba fiszek w talii
- Dostępne są przyciski edycji i usunięcia dla każdej fiszki

US-022
Tytuł: Edycja istniejącej fiszki
Opis: Jako użytkownik chcę edytować zapisaną fiszkę, aby poprawić błędy lub zaktualizować informacje.
Kryteria akceptacji:
- Formularz edycji zawiera aktualne pytanie i odpowiedź
- Można zmienić zarówno pytanie jak i odpowiedź
- Obsługiwane jest podstawowe formatowanie Markdown
- System zapisuje datę ostatniej modyfikacji
- Historia powtórek fiszki jest zachowywana

US-023
Tytuł: Usuwanie fiszki
Opis: Jako użytkownik chcę usunąć fiszkę, która jest niepotrzebna lub zawiera błędy.
Kryteria akceptacji:
- Przycisk usunięcia jest dostępny w widoku fiszki i na liście
- System wyświetla prośbę o potwierdzenie usunięcia
- Po usunięciu fiszka jest trwale usuwana wraz z historią powtórek
- System potwierdza pomyślne usunięcie

US-024
Tytuł: Wyszukiwanie fiszek w talii
Opis: Jako użytkownik chcę wyszukać fiszkę po treści, aby szybko znaleźć konkretną informację.
Kryteria akceptacji:
- Pole wyszukiwania jest widoczne w widoku talii
- Wyszukiwanie przeszukuje pytania i odpowiedzi
- Wyniki są wyświetlane w czasie rzeczywistym
- Brak wyników wyświetla odpowiedni komunikat
- Można wyczyścić wyszukiwanie i wrócić do pełnej listy

### Sesja nauki

US-025
Tytuł: Rozpoczęcie sesji nauki
Opis: Jako użytkownik chcę rozpocząć sesję nauki z wybranej talii, aby powtórzyć zaplanowane fiszki.
Kryteria akceptacji:
- Przycisk "Rozpocznij naukę" jest widoczny przy każdej talii z kartami do powtórki
- System ładuje fiszki zaplanowane na dziś według algorytmu FSRS
- Jeśli nie ma kart do powtórki, wyświetlany jest odpowiedni komunikat
- Sesja rozpoczyna się w Focus Mode (minimalistyczny interfejs)

US-026
Tytuł: Wyświetlanie fiszki w sesji nauki
Opis: Jako użytkownik chcę widzieć pytanie i móc odsłonić odpowiedź, aby przetestować swoją wiedzę.
Kryteria akceptacji:
- Początkowo widoczne jest tylko pytanie
- Przycisk "Pokaż odpowiedź" odsłania odpowiedź
- Skrót klawiszowy (spacja) również odsłania odpowiedź
- Po odsłonięciu widoczne są przyciski oceny
- Numer aktualnej karty i łączna liczba kart są widoczne

US-027
Tytuł: Ocenianie fiszki w sesji nauki
Opis: Jako użytkownik chcę ocenić trudność fiszki, aby algorytm dostosował harmonogram powtórek.
Kryteria akceptacji:
- Dostępne są 4 przyciski oceny: Powtórz (1), Trudne (2), Dobrze (3), Łatwe (4)
- Skróty klawiszowe 1, 2, 3, 4 odpowiadają przyciskom
- Każdy przycisk pokazuje przewidywany czas do następnej powtórki
- Po ocenie automatycznie wyświetlana jest następna fiszka
- Ocena jest zapisywana w historii powtórek
- Algorytm FSRS oblicza nowy termin powtórki

US-028
Tytuł: Zakończenie sesji nauki
Opis: Jako użytkownik chcę zobaczyć podsumowanie sesji po jej zakończeniu, aby ocenić swoje postępy.
Kryteria akceptacji:
- Po ostatniej fiszce wyświetlane jest podsumowanie
- Podsumowanie zawiera: liczbę powtórzonych kart, rozkład ocen (ile razy każda ocena)
- Wyświetlany jest czas trwania sesji
- Przycisk "Wróć do dashboardu" kończy sesję
- Opcja "Ucz się dalej" pozwala kontynuować z kolejnymi kartami (jeśli dostępne)

US-029
Tytuł: Przerwanie sesji nauki
Opis: Jako użytkownik chcę móc przerwać sesję w dowolnym momencie, zachowując postępy.
Kryteria akceptacji:
- Przycisk "Zakończ sesję" jest widoczny podczas sesji
- Postępy (oceny już wykonane) są zapisywane
- Nieprzejrzane fiszki pozostają w kolejce na dziś
- System wyświetla częściowe podsumowanie

### Dashboard i nawigacja

US-030
Tytuł: Widok dashboardu użytkownika
Opis: Jako użytkownik chcę widzieć przegląd moich materiałów i postępów na stronie głównej po zalogowaniu.
Kryteria akceptacji:
- Dashboard wyświetla wskaźnik "Karty na dziś" - łączna liczba kart do powtórki
- Widoczna jest lista talii z liczbą kart do powtórki
- Dostępne są skróty do tworzenia nowych fiszek i talii
- Dashboard ładuje się szybko (poniżej 2 sekund)

US-031
Tytuł: Nawigacja w aplikacji
Opis: Jako użytkownik chcę łatwo nawigować między różnymi sekcjami aplikacji.
Kryteria akceptacji:
- Nawigacja główna zawiera: Dashboard, Moje talie, Utwórz fiszki
- Logo/nazwa aplikacji przekierowuje na dashboard
- Aktualna sekcja jest wyróżniona w nawigacji
- Nawigacja jest responsywna (menu hamburger na mobile)
- Przycisk wylogowania jest zawsze dostępny

### Dostępność i UX

US-032
Tytuł: Responsywność interfejsu
Opis: Jako użytkownik chcę korzystać z aplikacji na różnych urządzeniach, aby uczyć się w dowolnym miejscu.
Kryteria akceptacji:
- Interfejs dostosowuje się do szerokości ekranu (desktop, tablet, mobile)
- Elementy interaktywne mają odpowiedni rozmiar na urządzeniach dotykowych
- Sesja nauki jest w pełni funkcjonalna na mobile
- Formularze są łatwe do wypełnienia na urządzeniach mobilnych

US-033
Tytuł: Skróty klawiszowe w sesji nauki
Opis: Jako zaawansowany użytkownik chcę używać skrótów klawiszowych, aby przyspieszyć sesję nauki.
Kryteria akceptacji:
- Spacja odsłania odpowiedź
- Klawisze 1, 2, 3, 4 odpowiadają ocenom
- Skróty działają tylko gdy sesja jest aktywna
- Informacja o skrótach jest widoczna lub dostępna w pomocy

US-034
Tytuł: Obsługa błędów i walidacja
Opis: Jako użytkownik chcę otrzymywać jasne komunikaty o błędach, aby wiedzieć jak je naprawić.
Kryteria akceptacji:
- Błędy walidacji są wyświetlane przy odpowiednich polach
- Komunikaty o błędach są zrozumiałe dla użytkownika
- Błędy sieciowe wyświetlają odpowiedni komunikat z opcją ponowienia
- Formularze nie tracą danych przy błędach walidacji

### Analityka i feedback

US-035
Tytuł: Śledzenie akceptacji fiszek AI
Opis: Jako właściciel produktu chcę mierzyć wskaźnik akceptacji fiszek AI, aby optymalizować jakość generatora.
Kryteria akceptacji:
- System oznacza fiszki flagą is_accepted przy zapisie
- System zapisuje oryginalną wersję fiszki AI przed edycją
- Porównanie tekstu pozwala określić czy fiszka była modyfikowana
- Dane są dostępne w PostHog do analizy

US-036
Tytuł: Feedback przy regeneracji fiszek
Opis: Jako użytkownik chcę móc poprosić o regenerację fiszek z dodatkowymi instrukcjami, gdy wynik jest niezadowalający.
Kryteria akceptacji:
- Przycisk "Generuj ponownie" jest dostępny w widoku podglądu
- Pole tekstowe pozwala dodać instrukcje dla AI (np. "więcej szczegółów", "prostsze pytania")
- Instrukcje są logowane w PostHog jako feedback
- Nowe fiszki zastępują poprzednie w widoku podglądu

## 6. Metryki sukcesu

### 6.1 Metryki główne (KPIs)

Wskaźnik akceptacji AI
- Cel: 75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkowników
- Definicja: Fiszka jest "zaakceptowana" jeśli została zapisana bez istotnych zmian (mniej niż 20% zmian w treści)
- Pomiar: Porównanie tekstu oryginalnego i zapisanego w bazie Supabase
- Częstotliwość: Mierzone w czasie rzeczywistym, raportowane tygodniowo

Adopcja AI
- Cel: 75% wszystkich fiszek w systemie jest tworzonych z wykorzystaniem AI
- Definicja: Stosunek fiszek oznaczonych jako wygenerowane przez AI do wszystkich fiszek
- Pomiar: Zapytanie do bazy Supabase (source = 'ai' vs source = 'manual')
- Częstotliwość: Mierzone w czasie rzeczywistym, raportowane tygodniowo

### 6.2 Metryki pomocnicze

Średni czas generowania fiszek
- Cel: Poniżej 30 sekund dla tekstu o maksymalnej długości
- Pomiar: Timestamp rozpoczęcia i zakończenia generowania (PostHog)

Liczba fiszek na sesję generowania
- Średnia liczba fiszek akceptowanych z jednego tekstu źródłowego
- Pomiar: Agregacja w bazie danych

Retencja użytkowników
- Cel: 40% użytkowników wraca do aplikacji w ciągu 7 dni
- Pomiar: Kohorty użytkowników w PostHog

Ukończenie sesji nauki
- Cel: 80% rozpoczętych sesji jest ukończonych
- Pomiar: Stosunek sesji zakończonych do rozpoczętych (PostHog)

Korelacja długości tekstu z jakością
- Analiza zależności między długością tekstu źródłowego a wskaźnikiem akceptacji
- Pomiar: Analiza korelacji w PostHog

### 6.3 Metryki techniczne

Czas ładowania dashboardu
- Cel: Poniżej 2 sekund
- Pomiar: Web Vitals (LCP)

Dostępność API
- Cel: 99.5% uptime
- Pomiar: Monitoring Supabase

Błędy generowania AI
- Cel: Poniżej 5% requestów kończy się błędem
- Pomiar: Logi błędów w PostHog
