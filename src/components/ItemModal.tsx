import { useState, useEffect } from "react";
import { CashflowItem, CashflowItemColor, COLOR_OPTIONS } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, amount: number, color: CashflowItemColor) => void;
  onDelete?: () => void;
  initialData?: CashflowItem | null;
}

export const ItemModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}: ItemModalProps) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState<CashflowItemColor>("blue");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setColor(initialData.color);
    } else {
      setTitle("");
      setAmount("");
      setColor("blue");
    }
  }, [initialData, isOpen]);

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return;
    
    onSave(title.trim(), numAmount, color);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-h3 text-foreground">
            {initialData ? "Edit Item" : "Add Item"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-body-sm font-medium text-foreground"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
              placeholder="Enter title"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="text-body-sm font-medium text-foreground"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-body-sm font-medium text-foreground">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`h-10 rounded-md border-2 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-ring ${
                    color === colorOption.value
                      ? "border-foreground scale-105"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: colorOption.hex }}
                  aria-label={colorOption.label}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {initialData && onDelete && (
            <Button
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
            >
              Delete
            </Button>
          )}
          <div className="flex gap-2 flex-1 sm:justify-end">
            <Button
              onClick={onClose}
              className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !amount.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
