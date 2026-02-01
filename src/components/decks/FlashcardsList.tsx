import type { FlashcardListItemDTO } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FlashcardRow } from "./FlashcardRow";

type FlashcardsListProps = {
  flashcards: FlashcardListItemDTO[];
  onOpen: (flashcardId: string) => void;
  onEdit: (flashcardId: string) => void;
  onDelete: (flashcardId: string, question: string) => void;
};

export function FlashcardsList({
  flashcards,
  onOpen,
  onEdit,
  onDelete,
}: FlashcardsListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pytanie</TableHead>
            <TableHead>Odpowiedź</TableHead>
            <TableHead className="text-center">Źródło</TableHead>
            <TableHead className="text-center">Następna powtórka</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flashcards.map((flashcard) => (
            <FlashcardRow
              key={flashcard.id}
              flashcard={flashcard}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
