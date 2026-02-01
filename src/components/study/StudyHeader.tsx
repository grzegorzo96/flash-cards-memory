import { Button } from "@/components/ui/button";

type StudyHeaderProps = {
  currentIndex: number;
  totalCards: number;
  progress: number;
  onEndSession: () => void;
};

export function StudyHeader({
  currentIndex,
  totalCards,
  progress,
  onEndSession,
}: StudyHeaderProps) {
  return (
    <header>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sesja nauki</h1>
          <p className="text-sm text-muted-foreground">
            Karta {currentIndex + 1} z {totalCards}
          </p>
        </div>
        <Button variant="outline" onClick={onEndSession}>
          Zakończ sesję
        </Button>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
