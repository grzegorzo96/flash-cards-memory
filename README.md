# 10xCards - Inteligentny Generator Fiszek

## Opis
Aplikacja Proof of Concept (PoC) generująca fiszki edukacyjne z dowolnego tekstu przy użyciu AI (Claude 3.5 Sonnet via OpenRouter).

## Funkcjonalności
- Generator fiszek z tekstu (limit 5000 znaków).
- Wybór dziedziny wiedzy.
- Podgląd wygenerowanych pytań i odpowiedzi.
- Estetyczny, nowoczesny interfejs (Dark Mode).

## Wymagania
- Node.js (v18+)
- Klucz API OpenRouter (z dostępem do modelu `anthropic/claude-3.5-sonnet` lub darmowych modeli)

## Instalacja
1. Zainstaluj zależności:
   ```bash
   npm install
   ```

## Konfiguracja
1. Zmień nazwę pliku `.env.example` na `.env` (jeśli istnieje) lub utwórz nowy.
2. Ustaw klucz API:
   ```bash
   OPENROUTER_API_KEY=twoj_klucz_api
   ```

## Uruchomienie
W trybie deweloperskim:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: http://localhost:4321
