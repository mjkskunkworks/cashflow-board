import { Pencil } from "lucide-react";
import { CashflowItem, COLOR_OPTIONS } from "../types";
import { useFormattedCurrency } from "../hooks/useFormattedCurrency";

interface ItemCardProps {
  item: CashflowItem;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const ItemCard = ({ item, onEdit, onDragStart, onDragEnd }: ItemCardProps) => {
  const { formatCurrency } = useFormattedCurrency();
  const colorHex = COLOR_OPTIONS.find(c => c.value === item.color)?.hex || "#3B82F6";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-card border border-border rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-move focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 overflow-hidden"
      tabIndex={0}
      role="button"
      aria-label={`${item.title}, ${formatCurrency(item.amount)}`}
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
              <p className="text-body-sm text-muted-foreground mb-1 truncate">
                {item.title}
              </p>
              <p className="text-h4 font-mono text-foreground" style={{ fontWeight: 500 }}>
                {formatCurrency(item.amount)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-shrink-0 p-2 rounded-md hover:bg-secondary transition-colors duration-fast text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
