import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import type { GetFlashcardResponseDTO, DeckListItemDTO, LanguageCode } from "@/types";
import { useCreateFlashcard } from "@/components/hooks/useCreateFlashcard";
import { useUpdateFlashcard } from "@/components/hooks/useUpdateFlashcard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const flashcardSchema = z.object({
  question: z
    .string()
    .min(1, "Pytanie jest wymagane")
    .max(2000, "Pytanie może mieć maksymalnie 2000 znaków"),
  answer: z
    .string()
    .min(1, "Odpowiedź jest wymagana")
    .max(2000, "Odpowiedź może mieć maksymalnie 2000 znaków"),
  source_language: z.enum(["pl", "en"]),
  target_language: z.enum(["pl", "en"]),
  deck_id: z.string().uuid("Wybierz talię"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

type FlashcardFormProps = {
  flashcardId?: string;
  initialData?: GetFlashcardResponseDTO | null;
  initialDeckId?: string | null;
  decks: DeckListItemDTO[];
};

export function FlashcardForm({
  flashcardId,
  initialData,
  initialDeckId,
  decks,
}: FlashcardFormProps) {
  const isEditMode = !!flashcardId;
  const { createFlashcard, isCreating } = useCreateFlashcard();
  const { updateFlashcard, isUpdating } = useUpdateFlashcard();

  const [formData, setFormData] = useState<FlashcardFormData>({
    question: initialData?.question || "",
    answer: initialData?.answer || "",
    source_language: "pl",
    target_language: "en",
    deck_id: initialDeckId || initialData?.deck_id || "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FlashcardFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        question: initialData.question,
        answer: initialData.answer,
        deck_id: initialData.deck_id,
      }));
    }
  }, [initialData]);

  const handleInputChange = useCallback(
    (field: keyof FlashcardFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSubmitError(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});
      setSubmitError(null);

      const validation = flashcardSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof FlashcardFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof FlashcardFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      if (isEditMode && flashcardId) {
        const result = await updateFlashcard(flashcardId, {
          question: validation.data.question,
          answer: validation.data.answer,
        });
        if (result) {
          window.location.href = `/decks/${formData.deck_id}`;
        } else {
          setSubmitError("Nie udało się zaktualizować fiszki. Spróbuj ponownie.");
        }
      } else {
        const result = await createFlashcard(validation.data.deck_id, {
          question: validation.data.question,
          answer: validation.data.answer,
          source_language: validation.data.source_language,
          target_language: validation.data.target_language,
        });
        if (result) {
          window.location.href = `/decks/${validation.data.deck_id}`;
        } else {
          setSubmitError("Nie udało się utworzyć fiszki. Spróbuj ponownie.");
        }
      }
    },
    [formData, isEditMode, flashcardId, createFlashcard, updateFlashcard]
  );

  const isSubmitting = isCreating || isUpdating;

  return (
    <Card className="mt-8">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="deck_id">
                Talia <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.deck_id}
                onValueChange={(value) => handleInputChange("deck_id", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="deck_id">
                  <SelectValue placeholder="Wybierz talię" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deck_id && (
                <p className="text-sm text-destructive">{errors.deck_id}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question">
              Pytanie <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              placeholder="Wpisz pytanie..."
              rows={4}
              disabled={isSubmitting}
              aria-invalid={!!errors.question}
              aria-describedby={errors.question ? "question-error" : undefined}
            />
            {errors.question && (
              <p id="question-error" className="text-sm text-destructive">
                {errors.question}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">
              Odpowiedź <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange("answer", e.target.value)}
              placeholder="Wpisz odpowiedź..."
              rows={4}
              disabled={isSubmitting}
              aria-invalid={!!errors.answer}
              aria-describedby={errors.answer ? "answer-error" : undefined}
            />
            {errors.answer && (
              <p id="answer-error" className="text-sm text-destructive">
                {errors.answer}
              </p>
            )}
          </div>

          {!isEditMode && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source_language">Język źródłowy</Label>
                <Select
                  value={formData.source_language}
                  onValueChange={(value) =>
                    handleInputChange("source_language", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="source_language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pl">Polski</SelectItem>
                    <SelectItem value="en">Angielski</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_language">Język docelowy</Label>
                <Select
                  value={formData.target_language}
                  onValueChange={(value) =>
                    handleInputChange("target_language", value)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="target_language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pl">Polski</SelectItem>
                    <SelectItem value="en">Angielski</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Zapisywanie..."
                  : "Tworzenie..."
                : isEditMode
                  ? "Zapisz zmiany"
                  : "Utwórz fiszkę"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
