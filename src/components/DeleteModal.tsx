import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteModal = ({ isOpen, onConfirm, onCancel }: DeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[400px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-h3 text-foreground">
            Delete this item?
          </DialogTitle>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            onClick={onCancel}
            className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
