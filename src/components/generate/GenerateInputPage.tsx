import { useState, useCallback, useEffect } from "react";
import { z } from "zod";
import { useCreateGenerationRequest } from "@/components/hooks/useCreateGenerationRequest";
import { useDecksList } from "@/components/hooks/useDecksList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const generateSchema = z.object({
  source_text: z
    .string()
    .min(100, "Tekst musi mieć minimum 100 znaków")
    .max(5000, "Tekst może mieć maksymalnie 5000 znaków"),
  target_language: z.enum(["pl", "en"]),
  deck_id: z.string().uuid("Wybierz talię").optional(),
});

type GenerateFormData = z.infer<typeof generateSchema>;

export default function GenerateInputPage() {
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDomain = sessionStorage.getItem("generate_domain");
      if (!savedDomain) {
        window.location.href = "/generate/setup";
      } else {
        setDomain(savedDomain);
      }
    }
  }, []);

  const [formData, setFormData] = useState<GenerateFormData>({
    source_text: "",
    target_language: "en",
    deck_id: undefined,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GenerateFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createGenerationRequest, isCreating, error: apiError } = useCreateGenerationRequest();
  const { data: decksData } = useDecksList({ include_counts: false });

  const handleInputChange = useCallback(
    (field: keyof GenerateFormData, value: string) => {
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

      const validation = generateSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof GenerateFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof GenerateFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      const result = await createGenerationRequest({
        source_text: validation.data.source_text,
        domain,
        target_language: validation.data.target_language,
        deck_id: validation.data.deck_id,
      });

      if (result) {
        if (apiError === "RATE_LIMIT") {
          window.location.href = "/generate/error";
        } else {
          window.location.href = `/generate/progress?requestId=${result.id}`;
        }
      } else {
        setSubmitError("Nie udało się rozpocząć generowania. Spróbuj ponownie.");
      }
    },
    [formData, domain, createGenerationRequest, apiError]
  );

  const charCount = formData.source_text.length;

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Generuj fiszki z AI
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dziedzina: <span className="font-semibold">{domain}</span>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Krok 2: Wprowadź tekst źródłowy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="deck_id">Talia (opcjonalnie)</Label>
              <Select
                value={formData.deck_id}
                onValueChange={(value) => handleInputChange("deck_id", value)}
                disabled={isCreating}
              >
                <SelectTrigger id="deck_id">
                  <SelectValue placeholder="Wybierz talię lub pomiń" />
                </SelectTrigger>
                <SelectContent>
                  {decksData?.items.map((deck) => (
                    <SelectItem key={deck.id} value={deck.id}>
                      {deck.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Jeśli nie wybierzesz talii, zostanie utworzona nowa
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="source_text">
                  Tekst źródłowy <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-sm ${
                    charCount < 100
                      ? "text-destructive"
                      : charCount > 5000
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {charCount} / 5000
                </span>
              </div>
              <Textarea
                id="source_text"
                value={formData.source_text}
                onChange={(e) => handleInputChange("source_text", e.target.value)}
                placeholder="Wklej tutaj tekst, z którego mają zostać wygenerowane fiszki..."
                rows={12}
                disabled={isCreating}
                aria-invalid={!!errors.source_text}
                aria-describedby={errors.source_text ? "source-text-error" : undefined}
              />
              {errors.source_text && (
                <p id="source-text-error" className="text-sm text-destructive">
                  {errors.source_text}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Wskazówka: Im bardziej uporządkowany tekst, tym lepsze wyniki
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_language">
                Język docelowy <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.target_language}
                onValueChange={(value) =>
                  handleInputChange("target_language", value)
                }
                disabled={isCreating}
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

            <div className="flex gap-3">
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Generowanie..." : "Generuj fiszki"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = "/generate/setup")}
                disabled={isCreating}
              >
                Wstecz
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
