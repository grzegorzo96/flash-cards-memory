import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type FlashcardsSearchProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function FlashcardsSearch({
  searchQuery,
  onSearchChange,
}: FlashcardsSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchChange(localQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localQuery, onSearchChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuery(e.target.value);
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Szukaj fiszek..."
              value={localQuery}
              onChange={handleChange}
              aria-label="Szukaj fiszek"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
