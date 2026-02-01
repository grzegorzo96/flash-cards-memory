import { useCallback } from "react";
import type { FlashcardListItemDTO } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type FlashcardRowProps = {
  flashcard: FlashcardListItemDTO;
  onOpen: (flashcardId: string) => void;
  onEdit: (flashcardId: string) => void;
  onDelete: (flashcardId: string, question: string) => void;
};

export function FlashcardRow({
  flashcard,
  onOpen,
  onEdit,
  onDelete,
}: FlashcardRowProps) {
  const handleOpen = useCallback(() => {
    onOpen(flashcard.id);
  }, [flashcard.id, onOpen]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(flashcard.id);
    },
    [flashcard.id, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(flashcard.id, flashcard.question);
    },
    [flashcard.id, flashcard.question, onDelete]
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "manual":
        return "Ręczne";
      case "ai_generated":
        return "AI";
      default:
        return source;
    }
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 transition-all duration-300 hover-lift"
      onClick={handleOpen}
    >
      <TableCell className="max-w-xs truncate font-medium">
        {flashcard.question}
      </TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">
        {flashcard.answer}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant={flashcard.source === "ai_generated" ? "default" : "secondary"} className="scale-in">
          {getSourceLabel(flashcard.source)}
        </Badge>
      </TableCell>
      <TableCell className="text-center text-sm">
        {formatDate(flashcard.next_due_at)}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleEdit} className="hover-lift">
            Edytuj
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            Usuń
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
