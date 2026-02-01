import { useState, useCallback } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const requestResetSchema = z.object({
  email: z.string().email("Nieprawidłowy format email"),
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
  });

type RequestResetFormData = z.infer<typeof requestResetSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordPageProps {
  isRecoveryMode?: boolean;
  tokenValid?: boolean;
}

export default function ResetPasswordPage({ 
  isRecoveryMode = false, 
  tokenValid = false 
}: ResetPasswordPageProps) {
  const [requestFormData, setRequestFormData] = useState<RequestResetFormData>({
    email: "",
  });

  const [resetFormData, setResetFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");

  const handleRequestInputChange = useCallback(
    (field: keyof RequestResetFormData, value: string) => {
      setRequestFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const handleResetInputChange = useCallback(
    (field: keyof ResetPasswordFormData, value: string) => {
      setResetFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    },
    []
  );

  const handleRequestSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const validation = requestResetSchema.safeParse(requestFormData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<string, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: validation.data.email,
          }),
        });

        if (response.ok) {
          setIsSuccess(true);
          setRequestedEmail(validation.data.email);
          return;
        }

        setErrors({ general: "Wystąpił błąd. Spróbuj ponownie." });
      } catch (error) {
        console.error("Reset password request error:", error);
        setErrors({ general: "Wystąpił błąd. Spróbuj ponownie." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [requestFormData]
  );

  const handleResetSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const validation = resetPasswordSchema.safeParse(resetFormData);

      if (!validation.success) {
        const fieldErrors: Partial<Record<string, string>> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/update-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: validation.data.password,
          }),
        });

        if (response.ok) {
          window.location.href = "/login?message=password_updated";
          return;
        }

        if (response.status === 401) {
          setErrors({ 
            general: "Sesja wygasła. Poproś o nowy link resetujący." 
          });
        } else {
          setErrors({ general: "Wystąpił błąd. Spróbuj ponownie." });
        }
      } catch (error) {
        console.error("Update password error:", error);
        setErrors({ general: "Wystąpił błąd. Spróbuj ponownie." });
      } finally {
        setIsSubmitting(false);
      }
    },
    [resetFormData]
  );

  if (isRecoveryMode && !tokenValid) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Link wygasł</CardTitle>
            <CardDescription>
              Link do resetowania hasła jest nieprawidłowy lub wygasł
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Link wygasł lub jest nieprawidłowy. Poproś o nowy link resetujący.
              </AlertDescription>
            </Alert>
            
            <Button className="w-full" asChild>
              <a href="/reset-password">Poproś o nowy link</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isRecoveryMode && tokenValid) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Ustaw nowe hasło</CardTitle>
            <CardDescription>
              Wprowadź nowe hasło do swojego konta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {errors.general && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nowe hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={resetFormData.password}
                  onChange={(e) => handleResetInputChange("password", e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={resetFormData.confirmPassword}
                  onChange={(e) => handleResetInputChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Zmiana hasła..." : "Zmień hasło"}
              </Button>

              <div className="text-center text-sm">
                <p>
                  <a href="/login" className="text-primary hover:underline">
                    Wróć do logowania
                  </a>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="container mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Link wysłany</CardTitle>
            <CardDescription>
              Sprawdź swoją skrzynkę pocztową
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Link do resetowania hasła został wysłany na adres <strong>{requestedEmail}</strong>.
                Link jest ważny przez 24 godziny.
              </AlertDescription>
            </Alert>
            
            <Button className="w-full" asChild>
              <a href="/login">Wróć do logowania</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

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
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={requestFormData.email}
                onChange={(e) => handleRequestInputChange("email", e.target.value)}
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

            <div className="text-center text-sm">
              <p>
                Pamiętasz hasło?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Zaloguj się
                </a>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
