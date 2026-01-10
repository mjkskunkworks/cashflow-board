import { Plus } from "lucide-react";
import { BucketType, CashflowItem, CashflowMode, DisplayPeriod } from "../types";
import { ItemCard } from "./ItemCard";

interface BucketPanelProps {
  title: BucketType;
  items: CashflowItem[];
  mode: CashflowMode;
  displayPeriod: DisplayPeriod;
  onAdd: () => void;
  onEditItem: (item: CashflowItem) => void;
  onDragStart: (item: CashflowItem) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, itemId?: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onItemDragOver: (itemId: string) => void;
  isDragOver: boolean;
  dragOverItemId: string | null;
  draggedItemId: string | null;
}

export const BucketPanel = ({
  title,
  items,
  mode,
  displayPeriod,
  onAdd,
  onEditItem,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onItemDragOver,
  isDragOver,
  dragOverItemId,
  draggedItemId,
}: BucketPanelProps) => {
  return (
    <div
      className={`bg-neutral-50 border-2 rounded-lg p-6 flex flex-col transition-all duration-200 ${
        isDragOver ? "border-primary bg-secondary" : "border-border"
      }`}
      onDrop={(e) => onDrop(e)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 font-semibold text-foreground">{title}</h2>
        <button
          onClick={onAdd}
          className="bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200 hover:text-neutral-600 h-8 w-8 p-0 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Add item to ${title}`}
        >
          <Plus className="w-4 h-4 mx-auto" strokeWidth={1.75} />
        </button>
      </div>
      
      <div className="flex-1 space-y-3 min-h-[200px]">
        {items.length === 0 ? (
          <p className="text-body-sm text-neutral-400 text-center py-8">
            No items yet. Click + to add one.
          </p>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              mode={mode}
              displayPeriod={displayPeriod}
              onEdit={() => onEditItem(item)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                onDragStart(item);
              }}
              onDragEnd={onDragEnd}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Don't highlight the item being dragged
                if (draggedItemId !== item.id) {
                  onItemDragOver(item.id);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDrop(e, item.id);
              }}
              isDragOver={dragOverItemId === item.id && draggedItemId !== item.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
