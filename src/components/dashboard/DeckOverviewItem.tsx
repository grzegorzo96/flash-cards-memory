import { useCallback } from "react";
import type { DashboardDeckDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DeckOverviewItemProps = {
  deck: DashboardDeckDTO;
  onOpen: (deckId: string) => void;
  onStartStudy: (deckId: string) => void;
};

export function DeckOverviewItem({
  deck,
  onOpen,
  onStartStudy,
}: DeckOverviewItemProps) {
  const handleOpen = useCallback(() => {
    onOpen(deck.id);
  }, [deck.id, onOpen]);

  const handleStartStudy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartStudy(deck.id);
    },
    [deck.id, onStartStudy]
  );

  return (
    <li>
      <Card
        className="cursor-pointer transition-all duration-300 hover-lift"
        onClick={handleOpen}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{deck.name}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary" className="scale-in">
                {deck.card_count} {deck.card_count === 1 ? "karta" : "kart"}
              </Badge>
              {deck.due_today_count > 0 && (
                <Badge variant="default" className="scale-in" style={{ animationDelay: '0.1s' }}>
                  {deck.due_today_count} do powtórki
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {deck.due_today_count === 0
                ? "Brak kart do powtórki"
                : `${deck.due_today_count} ${deck.due_today_count === 1 ? "karta" : "kart"} czeka na powtórkę`}
            </p>
            {deck.due_today_count > 0 && (
              <Button onClick={handleStartStudy} size="sm" className="hover-glow">
                Rozpocznij naukę
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
