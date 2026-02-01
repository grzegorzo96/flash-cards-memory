import { useCallback } from "react";
import type { DeckListItemDTO } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DeckRowProps = {
  deck: DeckListItemDTO;
  onOpen: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onDelete: (deckId: string, deckName: string) => void;
  onStartStudy: (deckId: string) => void;
};

export function DeckRow({
  deck,
  onOpen,
  onEdit,
  onDelete,
  onStartStudy,
}: DeckRowProps) {
  const handleOpen = useCallback(() => {
    onOpen(deck.id);
  }, [deck.id, onOpen]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(deck.id);
    },
    [deck.id, onEdit]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(deck.id, deck.name);
    },
    [deck.id, deck.name, onDelete]
  );

  const handleStartStudy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStartStudy(deck.id);
    },
    [deck.id, onStartStudy]
  );

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleOpen}
    >
      <TableCell className="font-medium">{deck.name}</TableCell>
      <TableCell className="max-w-md truncate text-muted-foreground">
        {deck.description || "—"}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="secondary">{deck.card_count}</Badge>
      </TableCell>
      <TableCell className="text-center">
        {deck.due_today_count > 0 ? (
          <Badge variant="default">{deck.due_today_count}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {deck.due_today_count > 0 && (
            <Button size="sm" onClick={handleStartStudy}>
              Ucz się
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleEdit}>
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
