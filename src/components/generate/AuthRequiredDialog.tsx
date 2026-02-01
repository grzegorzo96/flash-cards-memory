import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type AuthRequiredDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl: string;
};

export function AuthRequiredDialog({ isOpen, onClose, redirectUrl }: AuthRequiredDialogProps) {
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
  const registerUrl = `/register?redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Zaloguj się, aby zapisać fiszki</DialogTitle>
          <DialogDescription>
            Twoje fiszki są gotowe! Zaloguj się lub zarejestruj, aby je zapisać i rozpocząć
            naukę.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Po zalogowaniu wrócisz do tego ekranu i będziesz mógł zapisać wygenerowane fiszki
            w swojej talii.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Anuluj
          </Button>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <a href={registerUrl}>Zarejestruj się</a>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <a href={loginUrl}>Zaloguj się</a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
