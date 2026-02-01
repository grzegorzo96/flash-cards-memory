import { useState, useCallback } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof ResetPasswordFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const validation = resetPasswordSchema.safeParse(formData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ResetPasswordFormData] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsSubmitting(true);
      
      // MVP: Placeholder - brak rzeczywistego resetu hasła
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);
    },
    [formData]
  );

  return (
    <main className="container mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Reset hasła</CardTitle>
          <CardDescription>
            Wprowadź swój email, aby zresetować hasło
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Link do resetowania hasła został wysłany na podany adres email.
                  (MVP: To jest tylko placeholder)
                </AlertDescription>
              </Alert>
              <Button className="w-full" asChild>
                <a href="/login">Wróć do logowania</a>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Alert>
                <AlertDescription>
                  MVP: Autoryzacja zostanie dodana w przyszłości. Ta funkcja jest
                  obecnie niedostępna.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="twoj@email.com"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <p>
                  Pamiętasz hasło?{" "}
                  <a href="/login" className="text-primary hover:underline">
                    Zaloguj się
                  </a>
                </p>
                <p>
                  <a href="/dashboard" className="text-primary hover:underline">
                    Przejdź do dashboard (MVP)
                  </a>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
