import type { DeckListItemDTO } from "@/types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeckRow } from "./DeckRow";

type DecksTableProps = {
  decks: DeckListItemDTO[];
  onOpen: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onDelete: (deckId: string, deckName: string) => void;
  onStartStudy: (deckId: string) => void;
};

export function DecksTable({
  decks,
  onOpen,
  onEdit,
  onDelete,
  onStartStudy,
}: DecksTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead className="text-center">Liczba kart</TableHead>
            <TableHead className="text-center">Do powtórki</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.map((deck) => (
            <DeckRow
              key={deck.id}
              deck={deck}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
              onStartStudy={onStartStudy}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
