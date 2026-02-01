# REST API Plan

## 1. Resources
- Decks (`decks`)
- Flashcards (`flashcards`)
- Generation requests (`generation_requests`)
- Study sessions (`study_sessions`)
- Review events (`review_events`)
- Auth users (`auth.users`, kept for future auth)

## 2. Endpoints

### Auth
Authentication is disabled for the initial MVP. All API operations are available to any visitor.

### Decks
- **GET** `/api/decks`
  - **Description**: List user decks with counts.
  - **Query params**: `limit`, `offset`, `sort` (`name|created_at|due_count`), `order` (`asc|desc`), `include_counts` (`true|false`)
  - **Response JSON**:
    ```json
    {
      "items": [
        {
          "id": "uuid",
          "name": "Biology",
          "description": "Cell biology",
          "created_at": "ts",
          "updated_at": "ts",
          "card_count": 120,
          "due_today_count": 15
        }
      ],
      "limit": 20,
      "offset": 0,
      "total": 4
    }
    ```
  - **Success**: `200 OK`

- **POST** `/api/decks`
  - **Description**: Create new deck.
  - **Request JSON**:
    ```json
    { "name": "Biology", "description": "Cell biology" }
    ```
  - **Response JSON**:
    ```json
    { "id": "uuid", "name": "Biology", "description": "Cell biology" }
    ```
  - **Success**: `201 Created`
  - **Errors**: `400 ValidationError`, `409 DeckNameExists`

- **GET** `/api/decks/{deckId}`
  - **Description**: Get deck details.
  - **Response JSON**:
    ```json
    { "id": "uuid", "name": "Biology", "description": "Cell biology" }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

- **PATCH** `/api/decks/{deckId}`
  - **Description**: Update deck name/description.
  - **Request JSON**:
    ```json
    { "name": "Biology 101", "description": "Basics" }
    ```
  - **Response JSON**:
    ```json
    { "id": "uuid", "name": "Biology 101", "description": "Basics" }
    ```
  - **Success**: `200 OK`
  - **Errors**: `400 ValidationError`, `409 DeckNameExists`, `404 NotFound`

- **DELETE** `/api/decks/{deckId}`
  - **Description**: Soft-delete deck and its flashcards (set `deleted_at`).
  - **Response JSON**:
    ```json
    { "ok": true }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

### Flashcards
- **GET** `/api/decks/{deckId}/flashcards`
  - **Description**: List flashcards in a deck.
  - **Query params**: `limit`, `offset`, `sort` (`created_at|updated_at|next_due_at`), `order`, `q` (full-text search)
  - **Response JSON**:
    ```json
    {
      "items": [
        {
          "id": "uuid",
          "question": "What is a cell?",
          "answer": "The basic unit of life.",
          "source": "ai",
          "is_accepted": true,
          "source_language": "en",
          "target_language": "en",
          "last_reviewed_at": "ts",
          "next_due_at": "ts",
          "created_at": "ts",
          "updated_at": "ts"
        }
      ],
      "limit": 20,
      "offset": 0,
      "total": 120
    }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 DeckNotFound`

- **POST** `/api/decks/{deckId}/flashcards`
  - **Description**: Create a manual flashcard.
  - **Request JSON**:
    ```json
    {
      "question": "What is a cell?",
      "answer": "The basic unit of life.",
      "source_language": "en",
      "target_language": "en"
    }
    ```
  - **Response JSON**:
    ```json
    { "id": "uuid", "source": "manual", "is_accepted": true }
    ```
  - **Success**: `201 Created`
  - **Errors**: `400 ValidationError`, `404 DeckNotFound`

- **GET** `/api/flashcards/{flashcardId}`
  - **Description**: Get a single flashcard.
  - **Response JSON**:
    ```json
    { "id": "uuid", "question": "...", "answer": "...", "deck_id": "uuid" }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

- **PATCH** `/api/flashcards/{flashcardId}`
  - **Description**: Update question/answer.
  - **Request JSON**:
    ```json
    { "question": "Updated?", "answer": "Updated." }
    ```
  - **Response JSON**:
    ```json
    { "id": "uuid", "updated_at": "ts" }
    ```
  - **Success**: `200 OK`
  - **Errors**: `400 ValidationError`, `404 NotFound`

- **DELETE** `/api/flashcards/{flashcardId}`
  - **Description**: Soft-delete flashcard (set `deleted_at`).
  - **Response JSON**:
    ```json
    { "ok": true }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

### AI Generation & Preview
Preview data is transient in the client. Persisted data begins at `generation_requests` and accepted `flashcards`.

- **POST** `/api/generation-requests`
  - **Description**: Start AI generation.
  - **Request JSON**:
    ```json
    {
      "deck_id": "uuid-or-null",
      "source_text": "text up to 5000 chars",
      "domain": "Medicine",
      "target_language": "en",
      "instructions": "optional feedback for regeneration"
    }
    ```
  - **Response JSON**:
    ```json
    {
      "id": "uuid",
      "status": "processing",
      "detected_source_language": "en"
    }
    ```
  - **Success**: `202 Accepted`
  - **Errors**: `400 ValidationError`, `429 TooManyRequests`

- **GET** `/api/generation-requests/{requestId}`
  - **Description**: Check generation status and fetch preview cards.
  - **Response JSON**:
    ```json
    {
      "id": "uuid",
      "status": "completed",
      "error_code": null,
      "error_message": null,
      "preview_cards": [
        { "question": "...", "answer": "...", "source": "ai" }
      ]
    }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

- **POST** `/api/generation-requests/{requestId}/accept`
  - **Description**: Persist accepted cards to a deck.
  - **Request JSON**:
    ```json
    {
      "deck_id": "uuid",
      "cards": [
        {
          "question": "Q1",
          "answer": "A1",
          "original_question": "AI Q1",
          "original_answer": "AI A1",
          "source": "ai",
          "is_accepted": true,
          "source_language": "en",
          "target_language": "en"
        }
      ]
    }
    ```
  - **Response JSON**:
    ```json
    { "saved_count": 12, "flashcard_ids": ["uuid"] }
    ```
  - **Success**: `201 Created`
  - **Errors**: `400 ValidationError`, `404 NotFound`

### Study Sessions & Reviews
- **POST** `/api/study-sessions`
  - **Description**: Start a study session.
  - **Request JSON**:
    ```json
    { "deck_id": "uuid" }
    ```
  - **Response JSON**:
    ```json
    {
      "id": "uuid",
      "status": "in_progress",
      "cards": [
        { "id": "uuid", "question": "...", "answer": "..." }
      ]
    }
    ```
  - **Success**: `201 Created`
  - **Errors**: `404 DeckNotFound`

- **POST** `/api/study-sessions/{sessionId}/review-events`
  - **Description**: Submit a review rating and update scheduling.
  - **Request JSON**:
    ```json
    { "flashcard_id": "uuid", "rating": 3 }
    ```
  - **Response JSON**:
    ```json
    {
      "review_event_id": "uuid",
      "next_due_at": "ts",
      "stability": 2.5,
      "difficulty": 3.1,
      "retrievability": 0.87
    }
    ```
  - **Success**: `201 Created`
  - **Errors**: `400 ValidationError`, `404 NotFound`

- **PATCH** `/api/study-sessions/{sessionId}`
  - **Description**: Complete or abandon a session.
  - **Request JSON**:
    ```json
    { "status": "completed" }
    ```
  - **Response JSON**:
    ```json
    { "id": "uuid", "status": "completed", "ended_at": "ts" }
    ```
  - **Success**: `200 OK`
  - **Errors**: `400 ValidationError`, `404 NotFound`

- **GET** `/api/study-sessions/{sessionId}/summary`
  - **Description**: Session summary with rating distribution.
  - **Response JSON**:
    ```json
    { "cards_reviewed": 20, "ratings": { "1": 2, "2": 5, "3": 9, "4": 4 } }
    ```
  - **Success**: `200 OK`
  - **Errors**: `404 NotFound`

### Dashboard
- **GET** `/api/dashboard`
  - **Description**: Aggregate counts for dashboard.
  - **Response JSON**:
    ```json
    {
      "due_today_total": 25,
      "decks": [
        { "id": "uuid", "name": "Biology", "card_count": 120, "due_today_count": 15 }
      ]
    }
    ```
  - **Success**: `200 OK`

## 3. Authentication and Authorization
- No authentication for MVP. Data is global to the instance (single-tenant).
- `auth.users` and `user_id` columns remain in the schema for future auth, but the API does not expose auth endpoints.
- The API uses a fixed system user id (or a per-device anonymous id stored in a cookie) to satisfy NOT NULL `user_id` constraints.
- RLS is disabled or configured to allow full access for the MVP. Re-enable RLS when auth is introduced.

## 4. Validation and Business Logic

### Decks
- `name` is required, min length 3.
- Unique within the instance (temporarily treat `user_id` as a fixed system user).
- `deleted_at` used for soft delete.

### Generation Requests
- `source_text` length 1–5000, plus frontend min 100 before enabling submit.
- `domain` required (predefined list in UI).
- `source_language` detected, `target_language` required.
- `status` transitions: `pending` → `processing` → `completed|failed`.
- `error_code`/`error_message` set on failures (timeout, AI unavailable).

### Flashcards
- `question` and `answer` length 1–2000.
- `source` is `ai` or `manual`.
- `is_accepted` true only when user saves.
- `original_question`/`original_answer` stored for AI cards prior to edits.
- `deleted_at` used for soft delete.

### Study Sessions & Review Events
- Review `rating` must be 1–4.
- Each review event updates `next_due_at` on flashcard using FSRS.
- `study_sessions.status` must be `in_progress|completed|abandoned`.

### Business Logic Mapping
- AI generation uses GPT-5.2 via Openrouter.ai, returns preview cards without persistence.
- Accept flow persists cards to `flashcards` and sets `is_accepted`.
- Regenerate with instructions creates a new generation request and replaces preview in UI; instructions logged to analytics.
- Search uses full-text index on `flashcards.question` and `flashcards.answer`.

### Performance and Security
- Pagination on all list endpoints (`limit`, `offset`).
- Sorting and filtering aligned with indexes (`deck_id`, `next_due_at`, `last_reviewed_at`).
- Rate limiting on generation endpoints (per instance, e.g. 5/min).
- Timeout handling for AI generation (60 seconds) with retriable errors.
