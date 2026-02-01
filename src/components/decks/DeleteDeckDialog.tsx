import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteDeckDialogProps = {
  isOpen: boolean;
  deckName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteDeckDialog({
  isOpen,
  deckName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteDeckDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const isConfirmValid = confirmText === deckName;

  const handleConfirm = useCallback(() => {
    if (isConfirmValid) {
      onConfirm();
    }
  }, [isConfirmValid, onConfirm]);

  const handleCancel = useCallback(() => {
    setConfirmText("");
    onCancel();
  }, [onCancel]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usuń talię</DialogTitle>
          <DialogDescription>
            Ta akcja jest nieodwracalna. Wszystkie fiszki w tej talii zostaną
            trwale usunięte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm">
            Aby potwierdzić, wpisz nazwę talii:{" "}
            <span className="font-semibold">{deckName}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirm-name">Nazwa talii</Label>
            <Input
              id="confirm-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deckName}
              disabled={isDeleting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
          >
            {isDeleting ? "Usuwanie..." : "Usuń talię"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
