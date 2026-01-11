import { Pencil } from "lucide-react";
import { CashflowItem, COLOR_OPTIONS, CashflowMode, DisplayPeriod } from "../types";
import { useFormattedCurrency } from "../hooks/useFormattedCurrency";
import { getNormalizedDisplayAmount, isWhatIfDisplayed, isDisabled, shouldShowWhatIfNote } from "../lib/utils";

interface ItemCardProps {
  item: CashflowItem;
  mode: CashflowMode;
  displayPeriod: DisplayPeriod;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

export const ItemCard = ({ 
  item, 
  mode, 
  displayPeriod,
  onEdit, 
  onDragStart, 
  onDragEnd, 
  onDragOver,
  onDrop,
  isDragOver = false
}: ItemCardProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const colorHex = COLOR_OPTIONS.find(c => c.value === item.color)?.hex || "#3B82F6";
  
  const normalizedAmount = getNormalizedDisplayAmount(item, mode, displayPeriod);
  const showingWhatIf = isWhatIfDisplayed(item, mode);
  const disabled = isDisabled(item, mode);
  const showNote = shouldShowWhatIfNote(item, mode);
  
  const amountText = normalizedAmount != null ? formatCurrency(normalizedAmount) : "$0.00";
  const purpleHex = COLOR_OPTIONS.find(c => c.value === "purple")?.hex || "#8B5CF6";
  const amountStyle = showingWhatIf 
    ? { color: purpleHex } 
    : disabled 
    ? {} 
    : {};
  const amountColorClass = disabled ? "text-neutral-400" : "";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group bg-card border rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-move focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden ${
        disabled 
          ? "border-neutral-300 opacity-60" 
          : isDragOver
          ? "border-primary border-2 shadow-lg"
          : "border-border"
      }`}
      tabIndex={0}
      role="button"
      aria-label={`${item.title}, ${amountText}`}
    >
      <div className="flex">
        <div 
          className="w-2 flex-shrink-0" 
          style={{ backgroundColor: disabled ? "#D1D5DB" : colorHex }}
          aria-hidden="true"
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`text-body-sm mb-1 truncate ${
                disabled ? "text-neutral-400" : "text-muted-foreground"
              }`}>
                {item.title}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className={`text-h4 font-mono ${amountColorClass}`} style={{ fontWeight: 500, ...amountStyle }}>
                  {amountText}
                </p>
                {item.isEstimate && (
                  <span
                    className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded"
                    title="Estimate"
                  >
                    EST
                  </span>
                )}
              </div>
              {showNote && (
                <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                  {item.whatIfNote}
                </p>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={`flex-shrink-0 p-2 rounded-md hover:bg-secondary transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary opacity-0 group-hover:opacity-100 ${
                disabled 
                  ? "text-neutral-300 hover:text-neutral-400" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Edit ${item.title}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
