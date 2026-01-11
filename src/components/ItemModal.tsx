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
}

const PREVIEW_PERIODS: DisplayPeriod[] = ["D", "W", "M", "Q", "Y"];

export const ItemModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  displayPeriod,
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
      setTitle("");
      setRealAmount("");
      setWhatIfAmount("");
      setFrequency("M");
      setIsEstimate(false);
      setWhatIfNote("");
      setColor("blue");
      setIconName(null);
    }
  }, [initialData, isOpen]);

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
              htmlFor="frequency"
              className="text-body-sm font-medium text-foreground"
            >
              Every:
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
              Mark variable or budgeted amounts
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="realAmount"
                className="text-body-sm font-medium text-foreground"
              >
                Real Amount <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="realAmount"
                type="number"
                step="0.01"
                value={realAmount}
                onChange={(e) => setRealAmount(e.target.value)}
                className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                placeholder="0.00"
              />
              {realPreviews && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1">
                  {realPreviews.map(({ period, amount }) => (
                    <span key={period} className="whitespace-nowrap">
                      {period}: {formatCurrency(amount)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="whatIfAmount"
                className="text-body-sm font-medium text-foreground"
              >
                What If Amount <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                id="whatIfAmount"
                type="number"
                step="0.01"
                value={whatIfAmount}
                onChange={(e) => setWhatIfAmount(e.target.value)}
                className="w-full h-10 px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast"
                placeholder="0.00"
              />
              {whatIfPreviews && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 mt-1">
                  {whatIfPreviews.map(({ period, amount }) => (
                    <span key={period} className="whitespace-nowrap">
                      {period}: {formatCurrency(amount)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="whatIfNote"
              className="text-body-sm font-medium text-foreground"
            >
              What-If note <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="whatIfNote"
              value={whatIfNote}
              onChange={(e) => setWhatIfNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-body bg-card text-foreground border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-fast resize-none"
              placeholder="Add a note about this what-if scenario..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-body-sm font-medium text-foreground">
              Icon
            </label>
            <div className="flex items-center gap-3">
              {/* Icon preview */}
              <span className="material-symbols-rounded icon-modal flex-shrink-0" style={{ color: "#18191B" }}>
                {iconName || "help"}
              </span>
              <div className="flex gap-2 flex-1">
                <Button
                  type="button"
                  onClick={() => setIsIconPickerOpen(true)}
                  className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-4 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Choose icon
                </Button>
                <Button
                  type="button"
                  onClick={() => setIconName(null)}
                  className="bg-transparent text-foreground border border-border hover:bg-secondary h-10 px-4 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Clear
                </Button>
              </div>
            </div>
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
