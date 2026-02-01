export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      decks: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      domains: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          deck_id: string
          deleted_at: string | null
          difficulty: number | null
          generation_request_id: string | null
          id: string
          is_accepted: boolean
          last_reviewed_at: string | null
          next_due_at: string | null
          original_answer: string | null
          original_question: string | null
          question: string
          source: Database["public"]["Enums"]["flashcard_source"]
          source_language: Database["public"]["Enums"]["language_code"]
          stability: number | null
          target_language: Database["public"]["Enums"]["language_code"]
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          deck_id: string
          deleted_at?: string | null
          difficulty?: number | null
          generation_request_id?: string | null
          id?: string
          is_accepted?: boolean
          last_reviewed_at?: string | null
          next_due_at?: string | null
          original_answer?: string | null
          original_question?: string | null
          question: string
          source: Database["public"]["Enums"]["flashcard_source"]
          source_language: Database["public"]["Enums"]["language_code"]
          stability?: number | null
          target_language: Database["public"]["Enums"]["language_code"]
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          deck_id?: string
          deleted_at?: string | null
          difficulty?: number | null
          generation_request_id?: string | null
          id?: string
          is_accepted?: boolean
          last_reviewed_at?: string | null
          next_due_at?: string | null
          original_answer?: string | null
          original_question?: string | null
          question?: string
          source?: Database["public"]["Enums"]["flashcard_source"]
          source_language?: Database["public"]["Enums"]["language_code"]
          stability?: number | null
          target_language?: Database["public"]["Enums"]["language_code"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_generation_request_id_fkey"
            columns: ["generation_request_id"]
            isOneToOne: false
            referencedRelation: "generation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_requests: {
        Row: {
          completed_at: string | null
          deck_id: string | null
          domain: string
          error_code: string | null
          error_message: string | null
          id: string
          requested_at: string
          source_language: Database["public"]["Enums"]["language_code"]
          source_text: string
          status: Database["public"]["Enums"]["generation_status"]
          target_language: Database["public"]["Enums"]["language_code"]
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          deck_id?: string | null
          domain: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          requested_at?: string
          source_language: Database["public"]["Enums"]["language_code"]
          source_text: string
          status?: Database["public"]["Enums"]["generation_status"]
          target_language: Database["public"]["Enums"]["language_code"]
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          deck_id?: string | null
          domain?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          requested_at?: string
          source_language?: Database["public"]["Enums"]["language_code"]
          source_text?: string
          status?: Database["public"]["Enums"]["generation_status"]
          target_language?: Database["public"]["Enums"]["language_code"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generation_requests_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
      review_events: {
        Row: {
          difficulty: number | null
          elapsed_days: number | null
          flashcard_id: string
          id: string
          next_due_at: string | null
          rating: number
          retrievability: number | null
          reviewed_at: string
          scheduled_days: number | null
          stability: number | null
          study_session_id: string | null
          user_id: string
        }
        Insert: {
          difficulty?: number | null
          elapsed_days?: number | null
          flashcard_id: string
          id?: string
          next_due_at?: string | null
          rating: number
          retrievability?: number | null
          reviewed_at?: string
          scheduled_days?: number | null
          stability?: number | null
          study_session_id?: string | null
          user_id: string
        }
        Update: {
          difficulty?: number | null
          elapsed_days?: number | null
          flashcard_id?: string
          id?: string
          next_due_at?: string | null
          rating?: number
          retrievability?: number | null
          reviewed_at?: string
          scheduled_days?: number | null
          stability?: number | null
          study_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_events_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_events_study_session_id_fkey"
            columns: ["study_session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_sessions: {
        Row: {
          created_at: string
          deck_id: string
          ended_at: string | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["study_session_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          deck_id: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["study_session_status"]
          user_id: string
        }
        Update: {
          created_at?: string
          deck_id?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["study_session_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      flashcard_source: "ai" | "manual"
      generation_status: "pending" | "processing" | "completed" | "failed"
      language_code: "pl" | "en"
      study_session_status: "in_progress" | "completed" | "abandoned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      flashcard_source: ["ai", "manual"],
      generation_status: ["pending", "processing", "completed", "failed"],
      language_code: ["pl", "en"],
      study_session_status: ["in_progress", "completed", "abandoned"],
    },
  },
} as const

