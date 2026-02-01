import { Card, CardContent } from "@/components/ui/card";

type KeyboardHintsProps = {
  isAnswerVisible: boolean;
};

export function KeyboardHints({ isAnswerVisible }: KeyboardHintsProps) {
  return (
    <Card className="mt-6 border-dashed">
      <CardContent className="py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-2 py-1 font-mono text-xs">
              Spacja
            </kbd>
            <span>Pokaż odpowiedź</span>
          </div>
          {isAnswerVisible && (
            <>
              <div className="flex items-center gap-2">
                <kbd className="rounded border bg-muted px-2 py-1 font-mono text-xs">
                  1-4
                </kbd>
                <span>Oceń kartę</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
