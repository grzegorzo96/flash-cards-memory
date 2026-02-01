import { useState, useCallback, useMemo } from "react";
import { useDomainsList } from "@/components/hooks/useDomainsList";
import { useCreateDomain } from "@/components/hooks/useCreateDomain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PREDEFINED_DOMAINS = [
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
];

type GenerateSetupPageProps = {
  isAuthenticated?: boolean;
};

export default function GenerateSetupPage({ isAuthenticated = false }: GenerateSetupPageProps) {
  const [domain, setDomain] = useState("Inne");
  const [customDomain, setCustomDomain] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: userDomains, isLoading: isLoadingDomains } = useDomainsList(isAuthenticated);
  const { createDomain, isCreating } = useCreateDomain();

  // Combine predefined domains with user domains, removing duplicates
  const allDomains = useMemo(() => {
    const userDomainNames = userDomains?.map((d) => d.name) || [];
    const combined = [...PREDEFINED_DOMAINS, ...userDomainNames, "Inne"];
    // Remove duplicates
    return Array.from(new Set(combined));
  }, [userDomains]);

  const handleContinue = useCallback(async () => {
    setIsProcessing(true);
    
    let finalDomain = domain;
    
    // If "Inne" is selected and custom domain is provided, save it first
    if (domain === "Inne" && customDomain.trim()) {
      finalDomain = customDomain.trim();
      
      // Create the domain in the database for authenticated users only
      if (isAuthenticated && typeof window !== "undefined") {
        try {
          await createDomain({ name: finalDomain });
        } catch (error) {
          console.error("Failed to save domain:", error);
          // Continue anyway - domain will be used but not saved
        }
      }
    }

    // Save to sessionStorage and navigate
    if (typeof window !== "undefined") {
      sessionStorage.setItem("generate_domain", finalDomain);
      window.location.href = "/generate/input";
    }
    
    setIsProcessing(false);
  }, [domain, customDomain, createDomain, isAuthenticated]);

  const isValid = domain !== "Inne" || customDomain.trim().length > 0;
  const isButtonDisabled = !isValid || isProcessing || isCreating || isLoadingDomains;

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
            {isLoadingDomains ? (
              <p className="text-sm text-muted-foreground">Ładowanie dziedzin...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {allDomains.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant={domain === suggestion ? "default" : "outline"}
                    onClick={() => setDomain(suggestion)}
                    className="justify-start"
                    disabled={isProcessing || isCreating}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
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
                disabled={isProcessing || isCreating}
              />
              {isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  Nowa dziedzina zostanie zapisana dla przyszłych użyć
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleContinue} disabled={isButtonDisabled}>
              {isProcessing || isCreating ? "Zapisywanie..." : "Kontynuuj"}
            </Button>
            <Button 
              variant="outline" 
              asChild
              disabled={isProcessing || isCreating}
            >
              <a href="/dashboard">Anuluj</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
