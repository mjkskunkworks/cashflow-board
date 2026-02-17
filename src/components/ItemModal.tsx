import { useState, useEffect, useMemo } from "react";
import { CashflowItem, CashflowItemColor, COLOR_OPTIONS, Frequency, DisplayPeriod, FREQUENCY_OPTIONS } from "../types";
import { normalizeAmount } from "../lib/utils";
import { useFormattedCurrency } from "../hooks/useFormattedCurrency";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconPickerModal } from "./IconPickerModal";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, realAmount: number | null, whatIfAmount: number | null, frequency: Frequency, isEstimate: boolean, whatIfNote: string | null, color: CashflowItemColor, iconName: string | null) => void;
  onDelete?: () => void;
  initialData?: CashflowItem | null;
  displayPeriod: DisplayPeriod; // Kept for consistency but not used in modal (previews show all periods)
  preservedData?: { name: string; color: CashflowItemColor; iconName: string | null } | null;
  onSwitchToGroup?: (name: string, color: CashflowItemColor, iconName: string | null) => void;
}

const PREVIEW_PERIODS: DisplayPeriod[] = ["D", "W", "M", "Q", "Y"];

export const ItemModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  displayPeriod,
  preservedData,
  onSwitchToGroup,
}: ItemModalProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const [title, setTitle] = useState("");
  const [realAmount, setRealAmount] = useState("");
  const [whatIfAmount, setWhatIfAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("M");
  const [isEstimate, setIsEstimate] = useState(false);
  const [whatIfNote, setWhatIfNote] = useState("");
  const [color, setColor] = useState<CashflowItemColor>("blue");
  const [iconName, setIconName] = useState<string | null>(null);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setRealAmount(initialData.realAmount != null ? initialData.realAmount.toString() : "");
      setWhatIfAmount(initialData.whatIfAmount != null ? initialData.whatIfAmount.toString() : "");
      setFrequency(initialData.frequency || "M");
      setIsEstimate(initialData.isEstimate ?? false);
      setWhatIfNote(initialData.whatIfNote ?? "");
      setColor(initialData.color);
      setIconName(initialData.iconName ?? null);
    } else {
      // Use preserved data if available, otherwise use defaults
      setTitle(preservedData?.name || "");
      setColor(preservedData?.color || "blue");
      setIconName(preservedData?.iconName ?? null);
      setRealAmount("");
      setWhatIfAmount("");
      setFrequency("M");
      setIsEstimate(false);
      setWhatIfNote("");
    }
  }, [initialData, isOpen, preservedData]);

  const parsedRealAmount = useMemo(() => {
    const parsed = realAmount.trim() ? parseFloat(realAmount.trim()) : NaN;
    return !isNaN(parsed) ? parsed : null;
  }, [realAmount]);

  const parsedWhatIfAmount = useMemo(() => {
    const parsed = whatIfAmount.trim() ? parseFloat(whatIfAmount.trim()) : NaN;
    return !isNaN(parsed) ? parsed : null;
  }, [whatIfAmount]);

  const getPreviewAmounts = (baseAmount: number | null, freq: Frequency) => {
    if (baseAmount == null) return null;
    return PREVIEW_PERIODS.map(period => ({
      period,
      amount: normalizeAmount(baseAmount, freq, period)
    }));
  };

  const realPreviews = getPreviewAmounts(parsedRealAmount, frequency);
  const whatIfPreviews = getPreviewAmounts(parsedWhatIfAmount, frequency);

  const handleSave = () => {
    if (!title.trim()) return;
    
    // Validation: at least one amount must be provided
    if (parsedRealAmount === null && parsedWhatIfAmount === null) return;
    
    const finalWhatIfNote = whatIfNote.trim() || null;
    onSave(title.trim(), parsedRealAmount, parsedWhatIfAmount, frequency, isEstimate, finalWhatIfNote, color, iconName);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const hasValidAmount = () => {
    return (parsedRealAmount !== null || parsedWhatIfAmount !== null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-popover text-popover-foreground">
        <DialogHeader>
          <DialogTitle className="text-h3 text-foreground">
            {initialData ? "Edit Item" : "Add Item"}
          </DialogTitle>
          {!initialData && onSwitchToGroup && (
            <p className="text-body-sm text-muted-foreground mt-1">
              To add a group instead,{" "}
              <button
                type="button"
                onClick={() => onSwitchToGroup(title || "", color, iconName)}
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
                  htmlFor="title"
                  className="text-body-sm font-medium text-foreground"
                >
                  Name
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                  placeholder="enter item name"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Amount section */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="realAmount"
                  className="text-body-sm font-medium text-foreground"
                >
                  Real amount
                </label>
                <input
                  id="realAmount"
                  type="number"
                  step="0.01"
                  value={realAmount}
                  onChange={(e) => setRealAmount(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                  placeholder="enter amount"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="whatIfAmount"
                  className="text-body-sm font-medium text-foreground"
                >
                  What-if amount
                </label>
                <input
                  id="whatIfAmount"
                  type="number"
                  step="0.01"
                  value={whatIfAmount}
                  onChange={(e) => setWhatIfAmount(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                  placeholder="enter amount"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="frequency"
                  className="text-body-sm font-medium text-foreground"
                >
                  Frequency
                </label>
                <select
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as Frequency)}
                  className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEstimate}
                  onChange={(e) => setIsEstimate(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <span className="text-body-sm font-medium text-foreground">
                  Estimate
                </span>
              </label>
              <p className="text-xs text-neutral-500 ml-6">
                for variable amts / rough budgets
              </p>
            </div>
          </div>

          {/* Details section */}
          <div className="space-y-2">
            <label
              htmlFor="whatIfNote"
              className="text-body-sm font-medium text-foreground"
            >
              "What-if" notes
            </label>
            <textarea
              id="whatIfNote"
              value={whatIfNote}
              onChange={(e) => setWhatIfNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast resize-none"
              placeholder='what would make the "what-if" amount true?'
            />
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
              disabled={!title.trim() || !hasValidAmount()}
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
