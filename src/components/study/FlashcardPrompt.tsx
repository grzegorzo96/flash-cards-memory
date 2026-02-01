import type { StudySessionCardDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FlashcardPromptProps = {
  card: StudySessionCardDTO;
  isAnswerVisible: boolean;
  onShowAnswer: () => void;
};

export function FlashcardPrompt({
  card,
  isAnswerVisible,
  onShowAnswer,
}: FlashcardPromptProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pytanie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl whitespace-pre-wrap">{card.question}</p>
        </CardContent>
      </Card>

      {!isAnswerVisible ? (
        <div className="flex justify-center">
          <Button size="lg" onClick={onShowAnswer}>
            Pokaż odpowiedź (Spacja)
          </Button>
        </div>
      ) : (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Odpowiedź</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl whitespace-pre-wrap">{card.answer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
