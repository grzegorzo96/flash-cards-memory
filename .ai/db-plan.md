# Schemat bazy danych (PostgreSQL)

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### `decks`
- `id` uuid PK DEFAULT gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `name` text NOT NULL
- `description` text NULL
- `created_at` timestamptz NOT NULL DEFAULT now()
- `updated_at` timestamptz NOT NULL DEFAULT now()
- `deleted_at` timestamptz NULL
- CONSTRAINTS:
  - UNIQUE (`user_id`, `name`)
  - CHECK (char_length(name) >= 3)

### `generation_requests`
- `id` uuid PK DEFAULT gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `deck_id` uuid NULL REFERENCES decks(id) ON DELETE SET NULL
- `source_text` text NOT NULL
- `domain` text NOT NULL
- `source_language` language_code NOT NULL
- `target_language` language_code NOT NULL
- `status` generation_status NOT NULL DEFAULT 'pending'
- `error_code` text NULL
- `error_message` text NULL
- `requested_at` timestamptz NOT NULL DEFAULT now()
- `completed_at` timestamptz NULL
- CONSTRAINTS:
  - CHECK (char_length(source_text) BETWEEN 1 AND 5000)

### `flashcards`
- `id` uuid PK DEFAULT gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `deck_id` uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- `generation_request_id` uuid NULL REFERENCES generation_requests(id) ON DELETE SET NULL
- `question` text NOT NULL
- `answer` text NOT NULL
- `original_question` text NULL
- `original_answer` text NULL
- `source` flashcard_source NOT NULL
- `is_accepted` boolean NOT NULL DEFAULT false
- `source_language` language_code NOT NULL
- `target_language` language_code NOT NULL
- `last_reviewed_at` timestamptz NULL
- `next_due_at` timestamptz NULL
- `created_at` timestamptz NOT NULL DEFAULT now()
- `updated_at` timestamptz NOT NULL DEFAULT now()
- `deleted_at` timestamptz NULL
- CONSTRAINTS:
  - CHECK (char_length(question) BETWEEN 1 AND 2000)
  - CHECK (char_length(answer) BETWEEN 1 AND 2000)

### `study_sessions`
- `id` uuid PK DEFAULT gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `deck_id` uuid NOT NULL REFERENCES decks(id) ON DELETE CASCADE
- `started_at` timestamptz NOT NULL DEFAULT now()
- `ended_at` timestamptz NULL
- `status` study_session_status NOT NULL DEFAULT 'in_progress'
- `created_at` timestamptz NOT NULL DEFAULT now()

### `review_events`
- `id` uuid PK DEFAULT gen_random_uuid()
- `user_id` uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `flashcard_id` uuid NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE
- `study_session_id` uuid NULL REFERENCES study_sessions(id) ON DELETE SET NULL
- `rating` smallint NOT NULL
- `reviewed_at` timestamptz NOT NULL DEFAULT now()
- `scheduled_days` integer NULL
- `elapsed_days` integer NULL
- `stability` numeric(6,2) NULL
- `difficulty` numeric(5,2) NULL
- `retrievability` numeric(5,4) NULL
- `next_due_at` timestamptz NULL
- CONSTRAINTS:
  - CHECK (rating BETWEEN 1 AND 4)

### Typy pomocnicze (ENUM)
- `language_code`: `'pl'`, `'en'`
- `flashcard_source`: `'ai'`, `'manual'`
- `generation_status`: `'pending'`, `'processing'`, `'completed'`, `'failed'`
- `study_session_status`: `'in_progress'`, `'completed'`, `'abandoned'`

## 2. Relacje między tabelami

- `auth.users` (1) -> (N) `decks` przez `decks.user_id`
- `auth.users` (1) -> (N) `generation_requests` przez `generation_requests.user_id`
- `decks` (1) -> (N) `flashcards` przez `flashcards.deck_id`
- `generation_requests` (1) -> (N) `flashcards` przez `flashcards.generation_request_id`
- `decks` (1) -> (N) `study_sessions` przez `study_sessions.deck_id`
- `flashcards` (1) -> (N) `review_events` przez `review_events.flashcard_id`
- `study_sessions` (1) -> (N) `review_events` przez `review_events.study_session_id`

## 3. Indeksy

- `decks`: UNIQUE index (`user_id`, `name`)
- `flashcards`: index (`deck_id`)
- `flashcards`: index (`user_id`, `next_due_at`)
- `flashcards`: index (`user_id`, `last_reviewed_at`)
- `review_events`: index (`flashcard_id`, `reviewed_at`)
- `review_events`: index (`study_session_id`)
- `generation_requests`: index (`user_id`, `requested_at`)
- `flashcards`: GIN index on `to_tsvector('simple', coalesce(question,'') || ' ' || coalesce(answer,''))`

## 4. Zasady PostgreSQL (RLS)

Włącz RLS na tabelach: `decks`, `generation_requests`, `flashcards`, `study_sessions`, `review_events`.

Polityki:
- SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()`
- Dla agregacji i statystyk: funkcje RPC z `SECURITY DEFINER`, które filtrują po `auth.uid()`.

## 5. Dodatkowe uwagi / decyzje projektowe

- `deleted_at` używane do soft-delete na `decks` i `flashcards` (analityka i audyt); fizyczne usunięcie możliwe przez osobne procesy.
- `original_question` i `original_answer` przechowują wersje AI przed edycją.
- `source_text` w `generation_requests` przechowuje tekst wejściowy do AI (limit 5000 znaków).
- Parametry FSRS w `review_events` to wyliczone wartości per zdarzenie, bez przechowywania globalnych wag/konfiguracji algorytmu.
- Ograniczenie języków do `pl`/`en` zgodnie z ustaleniami MVP; rozszerzenie w przyszłości przez aktualizację ENUM.
