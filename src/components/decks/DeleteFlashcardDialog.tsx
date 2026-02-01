import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteFlashcardDialogProps = {
  isOpen: boolean;
  flashcardQuestion: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteFlashcardDialog({
  isOpen,
  flashcardQuestion,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteFlashcardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuń fiszkę</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć tę fiszkę? Ta akcja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm">
            <span className="font-semibold">Pytanie:</span> {flashcardQuestion}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Usuwanie..." : "Usuń fiszkę"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
