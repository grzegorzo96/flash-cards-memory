import type { Enums, Tables } from "./db/database.types";

// Core entities (DB-aligned)
export type Deck = Tables<"decks">;
export type Domain = Tables<"domains">;
export type Flashcard = Tables<"flashcards">;
export type GenerationRequest = Tables<"generation_requests">;
export type StudySession = Tables<"study_sessions">;
export type ReviewEvent = Tables<"review_events">;

export type FlashcardSource = Enums<"flashcard_source">;
export type GenerationStatus = Enums<"generation_status">;
export type LanguageCode = Enums<"language_code">;
export type StudySessionStatus = Enums<"study_session_status">;

export type ApiSortOrder = "asc" | "desc";

export type PaginatedResponse<TItem> = {
  items: TItem[];
  limit: number;
  offset: number;
  total: number;
};

export type PaginationQuery = {
  limit?: number;
  offset?: number;
  order?: ApiSortOrder;
};

// Decks
export type DeckSortField = "name" | "created_at" | "due_count";

export type DeckListQueryDTO = PaginationQuery & {
  sort?: DeckSortField;
  include_counts?: boolean;
};

export type DeckListItemDTO = Pick<
  Deck,
  "id" | "name" | "description" | "created_at" | "updated_at"
> & {
  // Aggregates computed outside of the `decks` table.
  card_count: number;
  due_today_count: number;
};

export type DeckListResponseDTO = PaginatedResponse<DeckListItemDTO>;

export type CreateDeckCommand = Pick<Deck, "name" | "description">;

export type DeckDetailsDTO = Pick<Deck, "id" | "name" | "description">;

export type CreateDeckResponseDTO = DeckDetailsDTO;
export type GetDeckResponseDTO = DeckDetailsDTO;

export type UpdateDeckCommand = Partial<Pick<Deck, "name" | "description">>;
export type UpdateDeckResponseDTO = DeckDetailsDTO;

export type DeleteResponseDTO = { ok: true };

// Domains
export type DomainListItemDTO = Pick<Domain, "id" | "name" | "created_at">;
export type DomainListResponseDTO = DomainListItemDTO[];

export type CreateDomainCommand = Pick<Domain, "name">;
export type CreateDomainResponseDTO = Pick<Domain, "id" | "name">;

// Flashcards
export type FlashcardSortField = "created_at" | "updated_at" | "next_due_at";

export type FlashcardListQueryDTO = PaginationQuery & {
  sort?: FlashcardSortField;
  q?: string;
};

export type FlashcardListItemDTO = Pick<
  Flashcard,
  | "id"
  | "question"
  | "answer"
  | "source"
  | "is_accepted"
  | "source_language"
  | "target_language"
  | "last_reviewed_at"
  | "next_due_at"
  | "created_at"
  | "updated_at"
>;

export type FlashcardListResponseDTO = PaginatedResponse<FlashcardListItemDTO>;

export type CreateFlashcardCommand = Pick<
  Flashcard,
  "question" | "answer" | "source_language" | "target_language"
>;

export type CreateFlashcardResponseDTO = Pick<
  Flashcard,
  "id" | "source" | "is_accepted"
>;

export type GetFlashcardResponseDTO = Pick<
  Flashcard,
  "id" | "question" | "answer" | "deck_id"
>;

export type UpdateFlashcardCommand = Partial<
  Pick<Flashcard, "question" | "answer">
>;

export type UpdateFlashcardResponseDTO = Pick<Flashcard, "id" | "updated_at">;

// AI Generation & Preview
export type GenerationRequestCreateCommand = Pick<
  GenerationRequest,
  "deck_id" | "source_text" | "domain" | "target_language"
> & {
  // Not persisted; used to inform AI regeneration.
  instructions?: string;
};

export type GenerationRequestCreateResponseDTO = Pick<
  GenerationRequest,
  "id" | "status"
> & {
  // Derived from `generation_requests.source_language`.
  detected_source_language: GenerationRequest["source_language"];
};

export type PreviewCardDTO = Pick<Flashcard, "question" | "answer" | "source">;

export type GenerationRequestStatusResponseDTO = Pick<
  GenerationRequest,
  "id" | "status" | "error_code" | "error_message" | "deck_id"
> & {
  preview_cards: PreviewCardDTO[];
};

export type AcceptedCardInputDTO = Pick<
  Flashcard,
  | "question"
  | "answer"
  | "original_question"
  | "original_answer"
  | "source"
  | "is_accepted"
  | "source_language"
  | "target_language"
>;

export type AcceptGeneratedCardsCommand = Pick<
  GenerationRequest,
  "deck_id"
> & {
  cards: AcceptedCardInputDTO[];
};

export type AcceptGeneratedCardsResponseDTO = {
  saved_count: number;
  flashcard_ids: Array<Flashcard["id"]>;
};

// Study Sessions & Reviews
export type StartStudySessionCommand = Pick<StudySession, "deck_id">;

export type StudySessionCardDTO = Pick<Flashcard, "id" | "question" | "answer">;

export type StartStudySessionResponseDTO = Pick<
  StudySession,
  "id" | "status"
> & {
  cards: StudySessionCardDTO[];
};

export type ReviewRating = ReviewEvent["rating"] & (1 | 2 | 3 | 4);

export type CreateReviewEventCommand = Pick<
  ReviewEvent,
  "flashcard_id"
> & {
  rating: ReviewRating;
};

export type CreateReviewEventResponseDTO = {
  review_event_id: ReviewEvent["id"];
  next_due_at: ReviewEvent["next_due_at"];
  stability: ReviewEvent["stability"];
  difficulty: ReviewEvent["difficulty"];
  retrievability: ReviewEvent["retrievability"];
};

export type UpdateStudySessionCommand = Pick<StudySession, "status">;

export type UpdateStudySessionResponseDTO = Pick<
  StudySession,
  "id" | "status" | "ended_at"
>;

export type StudySessionSummaryResponseDTO = {
  cards_reviewed: number;
  ratings: Record<ReviewRating, number>;
};

// Dashboard
export type DashboardDeckDTO = Pick<Deck, "id" | "name"> & {
  // Aggregates computed from related flashcards.
  card_count: number;
  due_today_count: number;
};

export type DashboardResponseDTO = {
  due_today_total: number;
  decks: DashboardDeckDTO[];
};
