import { useState, useEffect } from "react";
import { CashflowGroup, CashflowItemColor, COLOR_OPTIONS } from "../types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconPickerModal } from "./IconPickerModal";

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color: CashflowItemColor, iconName: string | null) => void;
  onDelete?: () => void;
  initialData?: CashflowGroup | null;
  preservedData?: { name: string; color: CashflowItemColor; iconName: string | null } | null;
  onSwitchToItem?: (name: string, color: CashflowItemColor, iconName: string | null) => void;
}

export const GroupModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  preservedData,
  onSwitchToItem,
}: GroupModalProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<CashflowItemColor>("blue");
  const [iconName, setIconName] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
      setIconName(initialData.iconName ?? null);
    } else {
      // Use preserved data if available, otherwise use defaults
      setName(preservedData?.name || "");
      setColor(preservedData?.color || "blue");
      setIconName(preservedData?.iconName ?? null);
    }
  }, [initialData, isOpen, preservedData]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), color, iconName);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-h3 text-foreground">
            {initialData ? "Edit Group" : "Add Group"}
          </DialogTitle>
          {!initialData && onSwitchToItem && (
            <p className="text-body-sm text-muted-foreground mt-1">
              To add an item instead,{" "}
              <button
                type="button"
                onClick={() => onSwitchToItem(name || "", color, iconName)}
                className="text-primary underline hover:text-primary-hover"
              >
                click here
              </button>
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Name section with icon in top-left */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Icon - 48px, clickable */}
              <button
                type="button"
                onClick={() => setIsIconPickerOpen(true)}
                className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Choose icon"
              >
                <span className="material-symbols-rounded icon-card" style={{ fontSize: '48px', color: '#18191B' }}>
                  {iconName || "help"}
                </span>
              </button>
              {/* Name label and input */}
              <div className="flex-1 space-y-2">
                <label
                  htmlFor="name"
                  className="text-body-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                  placeholder="enter group name"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Color section */}
          <div className="space-y-2">
            <label className="text-body-sm font-medium text-foreground">
              Color
            </label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  className={`rounded-md border-2 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0 ${
                    color === colorOption.value
                      ? "border-foreground scale-105"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ 
                    backgroundColor: colorOption.hex,
                    width: '28px',
                    height: '28px'
                  }}
                  aria-label={colorOption.label}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex gap-2">
            {initialData && onDelete && (
              <Button
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2"
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 h-10 px-6 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <IconPickerModal
        isOpen={isIconPickerOpen}
        onClose={() => setIsIconPickerOpen(false)}
        onSelect={setIconName}
        currentIconName={iconName}
      />
    </Dialog>
  );
};

