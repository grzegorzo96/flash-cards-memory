import { useState, useCallback } from 'react';
import { z } from 'zod';
import { Navigation } from './Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LanguageCode } from '@/types';

const DOMAIN_SUGGESTIONS = [
  'Programowanie',
  'Języki obce',
  'Medycyna',
  'Prawo',
  'Historia',
  'Geografia',
  'Matematyka',
  'Fizyka',
  'Chemia',
  'Biologia',
  'Inne',
];

const generateSchema = z.object({
  source_text: z
    .string()
    .min(100, 'Tekst musi mieć minimum 100 znaków')
    .max(5000, 'Tekst może mieć maksymalnie 5000 znaków'),
  target_language: z.enum(['pl', 'en']),
  domain: z.string().min(1, 'Wybierz dziedzinę'),
});

type GenerateFormData = z.infer<typeof generateSchema>;

export default function LandingPage() {
  const [formData, setFormData] = useState<GenerateFormData>({
    source_text: '',
    target_language: 'en',
    domain: 'Programowanie',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GenerateFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((field: keyof GenerateFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }, []);

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

      setIsSubmitting(true);

      try {
        const response = await fetch('/api/generation-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_text: validation.data.source_text,
            domain: validation.data.domain,
            target_language: validation.data.target_language,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          setSubmitError(errorData.error || 'Nie udało się rozpocząć generowania');
          setIsSubmitting(false);
          return;
        }

        const result = await response.json();
        window.location.href = `/generate/progress?requestId=${result.id}`;
      } catch (error) {
        setSubmitError('Wystąpił błąd. Spróbuj ponownie.');
        setIsSubmitting(false);
      }
    },
    [formData]
  );

  const charCount = formData.source_text.length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isGuest={true} />

      <main className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Wygeneruj fiszki AI za darmo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Przekształć swoje notatki w interaktywne fiszki edukacyjne przy pomocy sztucznej
            inteligencji. Bez rejestracji, bez zobowiązań.
          </p>
        </header>

        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle>Rozpocznij generowanie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Domain Selection */}
              <div className="space-y-2">
                <Label>Dziedzina</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DOMAIN_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant={formData.domain === suggestion ? 'default' : 'outline'}
                      onClick={() => handleInputChange('domain', suggestion)}
                      className="justify-start"
                      disabled={isSubmitting}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
                {errors.domain && (
                  <p className="text-sm text-destructive">{errors.domain}</p>
                )}
              </div>

              {/* Source Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="source_text">
                    Tekst źródłowy <span className="text-destructive">*</span>
                  </Label>
                  <span
                    className={`text-sm ${
                      charCount < 100
                        ? 'text-destructive'
                        : charCount > 5000
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {charCount} / 5000
                  </span>
                </div>
                <Textarea
                  id="source_text"
                  value={formData.source_text}
                  onChange={(e) => handleInputChange('source_text', e.target.value)}
                  placeholder="Wklej tutaj tekst, z którego mają zostać wygenerowane fiszki..."
                  rows={12}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.source_text}
                />
                {errors.source_text && (
                  <p className="text-sm text-destructive">{errors.source_text}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Wskazówka: Im bardziej uporządkowany tekst, tym lepsze wyniki
                </p>
              </div>

              {/* Target Language */}
              <div className="space-y-2">
                <Label htmlFor="target_language">
                  Język docelowy <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.target_language}
                  onValueChange={(value) => handleInputChange('target_language', value)}
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

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} size="lg">
                  {isSubmitting ? 'Generowanie...' : 'Generuj fiszki'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features Section */}
        <section className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🤖</div>
            <h3 className="font-semibold mb-2">Sztuczna inteligencja</h3>
            <p className="text-sm text-muted-foreground">
              Wykorzystujemy zaawansowane modele AI do tworzenia trafnych fiszek
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Szybkie generowanie</h3>
            <p className="text-sm text-muted-foreground">
              Otrzymaj gotowe fiszki w kilka sekund
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-semibold mb-2">Zapisz i ucz się</h3>
            <p className="text-sm text-muted-foreground">
              Zaloguj się, aby zapisać fiszki i rozpocząć naukę
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
