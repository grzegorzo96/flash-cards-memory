import type { GetFlashcardResponseDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FlashcardDetailsCardProps = {
  flashcard: GetFlashcardResponseDTO;
};

export function FlashcardDetailsCard({
  flashcard,
}: FlashcardDetailsCardProps) {
  return (
    <div className="space-y-6">
      <Card className="hover-lift scale-in">
        <CardHeader>
          <CardTitle>Pytanie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{flashcard.question}</p>
        </CardContent>
      </Card>

      <Card className="hover-lift scale-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>Odpowiedź</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{flashcard.answer}</p>
        </CardContent>
      </Card>
    </div>
  );
}
