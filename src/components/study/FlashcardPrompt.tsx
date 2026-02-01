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
      <Card className="scale-in">
        <CardHeader>
          <CardTitle className="text-lg">Pytanie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl whitespace-pre-wrap">{card.question}</p>
        </CardContent>
      </Card>

      {!isAnswerVisible ? (
        <div className="flex justify-center fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Button size="lg" onClick={onShowAnswer} className="hover-glow">
            Pokaż odpowiedź (Spacja)
          </Button>
        </div>
      ) : (
        <Card className="border-primary scale-in card-gradient-border">
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
