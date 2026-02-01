import { useState, useCallback } from "react";
import { z } from "zod";
import type { DeckDetailsDTO } from "@/types";
import { useCreateDeck } from "@/components/hooks/useCreateDeck";
import { useUpdateDeck } from "@/components/hooks/useUpdateDeck";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const deckSchema = z.object({
  name: z
    .string()
    .min(1, "Nazwa jest wymagana")
    .max(100, "Nazwa może mieć maksymalnie 100 znaków"),
  description: z
    .string()
    .max(500, "Opis może mieć maksymalnie 500 znaków")
    .optional(),
});

type DeckFormData = z.infer<typeof deckSchema>;

type DeckFormProps = {
  deckId?: string;
  initialData?: DeckDetailsDTO | null;
};

export function DeckForm({ deckId, initialData }: DeckFormProps) {
  const isEditMode = !!deckId;
  const { createDeck, isCreating } = useCreateDeck();
  const { updateDeck, isUpdating } = useUpdateDeck();

  const [formData, setFormData] = useState<DeckFormData>(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
  }));

  const [errors, setErrors] = useState<Partial<Record<keyof DeckFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (field: keyof DeckFormData, value: string) => {
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

      const validation = deckSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof DeckFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof DeckFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const dataToSubmit = {
        name: validation.data.name,
        description: validation.data.description || undefined,
      };

      if (isEditMode && deckId) {
        const result = await updateDeck(deckId, dataToSubmit);
        if (result) {
          window.location.href = `/decks/${deckId}`;
        } else {
          setSubmitError("Nie udało się zaktualizować talii. Spróbuj ponownie.");
        }
      } else {
        const result = await createDeck(dataToSubmit);
        if (result) {
          window.location.href = `/decks/${result.id}`;
        } else {
          setSubmitError("Nie udało się utworzyć talii. Spróbuj ponownie.");
        }
      }
    },
    [formData, isEditMode, deckId, createDeck, updateDeck]
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

          <div className="space-y-2">
            <Label htmlFor="name">
              Nazwa talii <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="np. Angielski - Podstawowe słownictwo"
              disabled={isSubmitting}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Krótki opis talii..."
              rows={4}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="text-sm text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Zapisywanie..."
                  : "Tworzenie..."
                : isEditMode
                  ? "Zapisz zmiany"
                  : "Utwórz talię"}
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
