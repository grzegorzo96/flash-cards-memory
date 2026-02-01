import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DOMAIN_SUGGESTIONS = [
  "Programowanie",
  "Języki obce",
  "Medycyna",
  "Prawo",
  "Historia",
  "Geografia",
  "Matematyka",
  "Fizyka",
  "Chemia",
  "Biologia",
  "Inne",
];

export default function GenerateSetupPage() {
  const [domain, setDomain] = useState("Inne");
  const [customDomain, setCustomDomain] = useState("");

  const handleContinue = useCallback(() => {
    const finalDomain = domain === "Inne" && customDomain ? customDomain : domain;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("generate_domain", finalDomain);
      window.location.href = "/generate/input";
    }
  }, [domain, customDomain]);

  const isValid = domain !== "Inne" || customDomain.trim().length > 0;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Generuj fiszki z AI
        </h1>
        <p className="mt-2 text-muted-foreground">
          Wybierz dziedzinę, aby rozpocząć generowanie fiszek
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Krok 1: Wybierz dziedzinę</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Dziedzina</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DOMAIN_SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant={domain === suggestion ? "default" : "outline"}
                  onClick={() => setDomain(suggestion)}
                  className="justify-start"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {domain === "Inne" && (
            <div className="space-y-2">
              <Label htmlFor="custom-domain">Własna dziedzina</Label>
              <Input
                id="custom-domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="np. Astronomia, Ekonomia..."
                maxLength={100}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleContinue} disabled={!isValid}>
              Kontynuuj
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard">Anuluj</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
