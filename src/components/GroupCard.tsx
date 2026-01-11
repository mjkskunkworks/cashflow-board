import { ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { CashflowGroup, CashflowItem, COLOR_OPTIONS, CashflowMode, DisplayPeriod } from "../types";
import { useFormattedCurrency } from "../hooks/useFormattedCurrency";
import { getActiveAmountForMath } from "../lib/utils";

interface GroupCardProps {
  group: CashflowGroup;
  childItems: CashflowItem[];
  mode: CashflowMode;
  displayPeriod: DisplayPeriod;
  onEdit: () => void;
  onToggle: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragOver?: boolean;
}

export const GroupCard = ({
  group,
  childItems,
  mode,
  displayPeriod,
  onEdit,
  onToggle,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver = false,
}: GroupCardProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const colorHex = COLOR_OPTIONS.find(c => c.value === group.color)?.hex || "#3B82F6";
  
  // Calculate group total: sum of normalized active amounts of child items
  const groupTotal = childItems.reduce((sum, item) => {
    return sum + getActiveAmountForMath(item, mode, displayPeriod);
  }, 0);
  
  const amountText = formatCurrency(groupTotal);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`group bg-card border rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-move focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden ${
        isDragOver
          ? "border-primary border-2 shadow-lg"
          : "border-border"
      }`}
      tabIndex={0}
      role="button"
      aria-label={`${group.name}, ${amountText}`}
    >
      <div className="flex">
        <div 
          className="w-2 flex-shrink-0" 
          style={{ backgroundColor: colorHex }}
          aria-hidden="true"
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {/* Chevron for expand/collapse */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="flex-shrink-0 p-1 hover:bg-secondary transition-colors duration-fast"
                  aria-label={group.isExpanded ? "Collapse group" : "Expand group"}
                  style={{ outline: 'none', border: 'none', background: 'transparent' }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onFocus={(e) => e.target.blur()}
                >
                  {group.isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                  )}
                </button>
                
                {/* Group name */}
                <p className="text-body-sm truncate text-muted-foreground">
                  {group.name}
                </p>
                
                {/* Stack icon */}
                <span className="material-symbols-rounded text-muted-foreground flex-shrink-0" style={{ fontSize: '16px', lineHeight: '1' }}>
                  stack
                </span>
              </div>
              
              {/* Group total */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-h4 font-mono" style={{ fontWeight: 500 }}>
                  {amountText}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={`flex-shrink-0 p-2 rounded-md hover:bg-secondary transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-primary opacity-0 group-hover:opacity-100 ${
                "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={`Edit ${group.name}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
