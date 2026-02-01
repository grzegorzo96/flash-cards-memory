import { useCallback } from "react";
import type { PreviewCardDTO } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type PreviewCardItemProps = {
  card: PreviewCardDTO;
  index: number;
  onEdit: (index: number, field: "question" | "answer", value: string) => void;
  onDelete: (index: number) => void;
};

export function PreviewCardItem({
  card,
  index,
  onEdit,
  onDelete,
}: PreviewCardItemProps) {
  const handleQuestionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onEdit(index, "question", e.target.value);
    },
    [index, onEdit]
  );

  const handleAnswerChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onEdit(index, "answer", e.target.value);
    },
    [index, onEdit]
  );

  const handleDelete = useCallback(() => {
    onDelete(index);
  }, [index, onDelete]);

  return (
    <Card className="hover-lift scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fiszka #{index + 1}</CardTitle>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Usuń
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${index}`}>Pytanie</Label>
          <Textarea
            id={`question-${index}`}
            value={card.question}
            onChange={handleQuestionChange}
            rows={3}
            className="transition-all duration-300 focus:scale-[1.02]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`answer-${index}`}>Odpowiedź</Label>
          <Textarea
            id={`answer-${index}`}
            value={card.answer}
            onChange={handleAnswerChange}
            rows={3}
            className="transition-all duration-300 focus:scale-[1.02]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
