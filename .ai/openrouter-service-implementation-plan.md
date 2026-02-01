# Plan wdrozenia uslugi OpenRouter

## 1. Opis uslugi

Usluga OpenRouter zapewnia jednolity interfejs do komunikacji z modelami LLM przez OpenRouter API. Odpowiada za budowanie zapytan (system/user), konfiguracje modelu i parametrow, opcjonalne wymuszenie formatu odpowiedzi JSON oraz walidacje i mapowanie odpowiedzi. W warstwie backendu (Astro + TypeScript) dziala jako serwis wykorzystywany przez endpointy API, z bezpiecznym przechowywaniem klucza API i kontrola limitow.

Kluczowe komponenty uslugi:
1. Konfiguracja i dostawca klucza API (bezpieczne ladowanie i walidacja).
2. Budowniczy wiadomosci (system/user) oraz kontekst czatu.
3. Konfiguracja modelu i parametrow (model name, temperature, max tokens, top_p, itp.).
4. Obsluga response_format z JSON Schema i walidacja odpowiedzi.
5. Warstwa transportowa HTTP (retries, timeouts, idempotencja).
6. Obsluga bledow i mapowanie na bledy domenowe.
7. Monitoring i logowanie (bez danych wrazliwych).

## 2. Opis konstruktora

Konstruktor przyjmuje konfiguracje srodowiskowa oraz zaleznosci do wstrzykniecia (np. klient HTTP, logger, walidator JSON Schema).

Przykladowe dane wejsciowe:
- `apiKey: string` (obowiazkowy, z env)
- `baseUrl: string` (domyslnie `https://openrouter.ai/api/v1`)
- `defaultModel: string`
- `defaultParams: ModelParams`
- `timeoutMs: number`
- `maxRetries: number`
- `logger?: Logger`
- `schemaValidator?: JsonSchemaValidator`

Konstruktor powinien:
- Walidowac obecnosci `apiKey`.
- Ustawic domyslne parametry.
- Przygotowac klienta HTTP z timeoutem i retry.
- Ustawic bezpieczne logowanie (maskowanie klucza).

## 3. Publiczne metody i pola

### 3.1. `generateChatCompletion(input: ChatCompletionInput): Promise<ChatCompletionResult>`

**Funkcjonalnosc**
- Buduje payload zgodny z OpenRouter API.
- Dodaje `system` i `user` messages.
- Ustawia `model`, `temperature`, `max_tokens`, `top_p`, `presence_penalty`, `frequency_penalty`.
- Opcjonalnie dodaje `response_format` z JSON Schema.
- Wysyla zadanie i mapuje odpowiedz.

**Przyklad wejsciowy**
- `systemMessage: string`
- `userMessage: string`
- `model?: string`
- `params?: ModelParams`
- `responseFormat?: JsonSchemaResponseFormat`

**Przyklad uzycia**
- Serwis generuje sformatowane dane do utworzenia fiszek.

### 3.2. `validateResponseSchema<T>(data: unknown, schema: JsonSchema): T`

**Funkcjonalnosc**
- Sprawdza zgodnosc odpowiedzi z JSON Schema.
- Zwraca typowany wynik lub rzuca blad walidacji.

### 3.3. `setDefaultModel(model: string): void`

**Funkcjonalnosc**
- Aktualizuje domyslny model w runtime (np. dla AB testow).

### 3.4. `setDefaultParams(params: ModelParams): void`

**Funkcjonalnosc**
- Aktualizuje domyslne parametry dla kolejnych zadan.

## 4. Prywatne metody i pola

### 4.1. `buildMessages(systemMessage: string, userMessage: string): OpenRouterMessage[]`

**Funkcjonalnosc**
- Zwraca tablice wiadomosci w kolejnosci: system -> user.
- Zapewnia obecnosc i minimalna tresc wiadomosci.

### 4.2. `buildPayload(input: ChatCompletionInput): OpenRouterPayload`

**Funkcjonalnosc**
- Buduje payload z modelem, parametrami i response_format.
- Obsluguje domyslne wartosci.

### 4.3. `sendRequest(payload: OpenRouterPayload): Promise<OpenRouterResponse>`

**Funkcjonalnosc**
- Wysyla request przez klienta HTTP.
- Stosuje timeout i retry.
- Zwraca surowa odpowiedz.

### 4.4. `mapResponse(response: OpenRouterResponse): ChatCompletionResult`

**Funkcjonalnosc**
- Wyciaga `choices[0].message.content`.
- Gdy `response_format` bylo uzyte, parsuje JSON i waliduje.

## 5. Obsluga bledow

Potencjalne scenariusze bledow:
1. Brak klucza API lub niepoprawna konfiguracja srodowiska.
2. Blad HTTP (4xx/5xx) z OpenRouter.
3. Timeout polaczenia.
4. Niepoprawny payload (np. brak system/user).
5. Niezgodnosc odpowiedzi z JSON Schema.
6. Limit requestow lub limit kosztow (rate limit / quota).
7. Brak odpowiedzi modelu lub pusta odpowiedz.

Zalecenia:
- Dla kazdego scenariusza zwracaj blad domenowy z kodem i komunikatem.
- Dla bledow zdalnych mapuj na bledy typu `UpstreamError`.
- Dla walidacji schema stosuj `SchemaValidationError`.
- Zawsze maskuj dane wrazliwe w logach.

## 6. Kwestie bezpieczenstwa

- Przechowuj `OPENROUTER_API_KEY` tylko w zmiennych srodowiskowych (np. `.env`).
- Nie loguj pelnych payloadow i odpowiedzi; maskuj klucz i ewentualne dane uzytkownika.
- Stosuj rate limiting na endpointach API (np. per uzytkownik).
- Waliduj wejscia uzytkownika przed wyslaniem do modelu.
- Ogranicz dostep do endpointow (autentykacja Supabase).

## 7. Plan wdrozenia krok po kroku

1. **Dodaj konfiguracje srodowiskowa**
   - Dodaj `OPENROUTER_API_KEY` i opcjonalnie `OPENROUTER_BASE_URL`.

2. **Zaimplementuj typy i interfejsy**
   - `ModelParams`, `OpenRouterMessage`, `OpenRouterPayload`, `ChatCompletionInput`, `ChatCompletionResult`.

3. **Stworz serwis OpenRouter**
   - Umiesc w `src/lib/services/openrouter/`.
   - Dodaj konstruktor z walidacja.

4. **Zaimplementuj budowanie komunikatow**
   - Wymagaj `systemMessage` i `userMessage`.
   - Uzywaj kolejnosci system -> user.

5. **Zaimplementuj response_format z JSON Schema**
   - Umozliw wlaczanie `response_format` per request.
   - Waliduj wynik przy uzyciu walidatora JSON Schema.

6. **Zaimplementuj klienta HTTP**
   - Uzyj `fetch` lub lekkiego klienta HTTP.
   - Dodaj timeout i retry z backoff.

7. **Dodaj mapowanie bledow**
   - Dla 401/403: `AuthError`.
   - Dla 429: `RateLimitError`.
   - Dla 5xx: `UpstreamError`.

8. **Integracja z endpointami API**
   - Zmien endpointy AI, aby korzystaly z serwisu OpenRouter.

9. **Logowanie i monitoring**
   - Dodaj identyfikatory requestow.
   - Loguj czas odpowiedzi i koszt.

---

## Szczegoly implementacyjne wymaganych elementow (przyklady)

### 1. Komunikat systemowy
1. Przyklad:
   - `systemMessage: "You are a helpful assistant that returns concise JSON."`
2. Implementacja:
   - Dodaj do `messages` jako pierwszy element z `role: "system"`.

### 2. Komunikat uzytkownika
1. Przyklad:
   - `userMessage: "Generate 5 flashcards about HTTP status codes."`
2. Implementacja:
   - Dodaj do `messages` jako drugi element z `role: "user"`.

### 3. Ustrukturyzowane odpowiedzi poprzez response_format
1. Przyklad:
   - `response_format: { type: "json_schema", json_schema: { name: "FlashcardsResponse", strict: true, schema: { type: "object", properties: { flashcards: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"] } } }, required: ["flashcards"] } } }`
2. Implementacja:
   - Dodaj `response_format` do payloadu tylko gdy jest wymagany.
   - Po otrzymaniu `message.content` parsuj JSON i waliduj schema.

### 4. Nazwa modelu
1. Przyklad:
   - `model: "openai/gpt-4o-mini"`
2. Implementacja:
   - Uzyj `input.model ?? defaultModel`.

### 5. Parametry modelu
1. Przyklad:
   - `params: { temperature: 0.2, max_tokens: 800, top_p: 0.9 }`
2. Implementacja:
   - Zlacz `defaultParams` z `input.params` (input nadpisuje default).

