import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateErrorPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Błąd generowania
        </h1>
        <p className="mt-2 text-muted-foreground">
          Wystąpił problem podczas generowania fiszek
        </p>
      </header>

      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Nie udało się wygenerować fiszek</AlertTitle>
        <AlertDescription>
          Generowanie fiszek nie powiodło się. Może to być spowodowane:
          <ul className="mt-2 list-inside list-disc">
            <li>Przekroczeniem limitu zapytań</li>
            <li>Problemem z jakością tekstu źródłowego</li>
            <li>Tymczasowym problemem z usługą AI</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Spróbuj ponownie za chwilę lub skontaktuj się z pomocą techniczną,
              jeśli problem się powtarza.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <a href="/generate/input">Spróbuj ponownie</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard">Wróć do dashboard</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
