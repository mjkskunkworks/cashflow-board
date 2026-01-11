import { Plus } from "lucide-react";
import { BucketType, CashflowItem, CashflowGroup, CashflowNode, CashflowMode, DisplayPeriod } from "../types";
import { ItemCard } from "./ItemCard";
import { GroupCard } from "./GroupCard";
import { useState, Fragment } from "react";

interface BucketPanelProps {
  title: BucketType;
  topLevelNodes: CashflowNode[]; // All top-level nodes (groups and items) in order
  allItems: CashflowItem[];
  mode: CashflowMode;
  displayPeriod: DisplayPeriod;
  onAddItem: () => void;
  onAddGroup: () => void;
  onEditItem: (item: CashflowItem) => void;
  onEditGroup: (group: CashflowGroup) => void;
  onToggleGroup: (groupId: string) => void;
  onDragStart: (node: CashflowItem | CashflowGroup) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, targetNodeId?: string, targetGroupId?: string | null, insertBeforeId?: string | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onItemDragOver: (itemId: string) => void;
  onGroupDragOver: (groupId: string) => void;
  onInsertBefore: (nodeId: string | null) => void;
  isDragOver: boolean;
  dragOverItemId: string | null;
  dragOverGroupId: string | null;
  draggedNodeId: string | null;
  draggedType: "ITEM" | "GROUP" | null;
  dragInsertBeforeId: string | null;
}

export const BucketPanel = ({
  title,
  topLevelNodes,
  allItems,
  mode,
  displayPeriod,
  onAddItem,
  onAddGroup,
  onEditItem,
  onEditGroup,
  onToggleGroup,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onItemDragOver,
  onGroupDragOver,
  onInsertBefore,
  isDragOver,
  dragOverItemId,
  dragOverGroupId,
  draggedNodeId,
  draggedType,
  dragInsertBeforeId,
}: BucketPanelProps) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Render nodes in their actual order from the nodes array
  // When a group is expanded, render its child items below it
  const renderNodes = () => {
    const result: React.ReactNode[] = [];
    
    // Render nodes in their actual order
    topLevelNodes.forEach((node) => {
      if (node.type === "GROUP") {
        const group = node;
        const childItems = allItems.filter((item) => item.groupId === group.id);
      
      result.push(
        <div key={group.id} className="space-y-0">
          {/* Divider line before group */}
          {dragInsertBeforeId === group.id && draggedNodeId && draggedNodeId !== group.id && (
            <div className="h-0.5 bg-primary -my-1.5 z-10" />
          )}
          <GroupCard
            group={group}
            childItems={childItems}
            mode={mode}
            displayPeriod={displayPeriod}
            onEdit={() => onEditGroup(group)}
            onToggle={() => onToggleGroup(group.id)}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              onDragStart(group);
            }}
            onDragEnd={onDragEnd}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedNodeId !== group.id) {
                // If dragging a group, show divider line for reordering
                if (draggedType === "GROUP") {
                  onInsertBefore(group.id);
                } else {
                  // If dragging an item, highlight group to show "add to group"
                  onGroupDragOver(group.id);
                }
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // When dragging groups, don't pass targetGroupId (groups can't nest)
              // Use dragInsertBeforeId for reordering
              if (draggedType === "GROUP") {
                onDrop(e, group.id, null, dragInsertBeforeId);
              } else {
                // When dragging items onto groups, pass targetGroupId to add to group
                onDrop(e, group.id, group.id, null);
              }
            }}
            isDragOver={dragOverGroupId === group.id && draggedNodeId !== group.id}
          />
          
          {/* Render child items if group is expanded */}
          {group.isExpanded && childItems.length > 0 && (
            <div className="pl-4 mt-3 space-y-3">
              {childItems.map((item) => (
                <Fragment key={item.id}>
                  {/* Divider line before child item */}
                  {dragInsertBeforeId === item.id && draggedNodeId && draggedNodeId !== item.id && (
                    <div className="h-0.5 bg-primary -my-1.5 z-10 pl-3" />
                  )}
                  <div className="pl-3">
                    <ItemCard
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
                      if (draggedNodeId !== item.id) {
                        // When reordering items inside a group, show divider line
                        onInsertBefore(item.id);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // When reordering items inside a group, maintain the groupId
                      // Pass the item's current groupId as targetGroupId
                      onDrop(e, item.id, item.groupId, dragInsertBeforeId);
                    }}
                    isDragOver={dragOverItemId === item.id && draggedNodeId !== item.id}
                  />
                  </div>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      );
      } else {
        // node.type === "ITEM" (top-level item)
        const item = node;
      result.push(
        <Fragment key={item.id}>
          {/* Divider line before item */}
          {dragInsertBeforeId === item.id && draggedNodeId && draggedNodeId !== item.id && (
            <div className="h-0.5 bg-primary -my-1.5 z-10" />
          )}
          <ItemCard
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
            if (draggedNodeId !== item.id) {
              // Show divider line for reordering
              onInsertBefore(item.id);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Use dragInsertBeforeId for reordering top-level items
            onDrop(e, item.id, null, dragInsertBeforeId);
          }}
          isDragOver={false}
        />
        </Fragment>
      );
      }
    });

    return result;
  };

  const hasContent = topLevelNodes.length > 0;

  return (
    <div
      className={`bg-neutral-50 border border-neutral-200 rounded-[10px] p-6 flex flex-col transition-all duration-200 ${
        isDragOver ? "border-primary bg-secondary" : ""
      }`}
      onDrop={(e) => onDrop(e)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h3 font-semibold text-foreground">{title}</h2>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200 hover:text-neutral-600 h-8 w-8 p-0 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
            aria-label={`Add to ${title}`}
          >
            <Plus className="w-4 h-4" strokeWidth={1.75} />
          </button>
          
          {showAddMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 mt-1 z-20 bg-white border border-neutral-200 rounded-md shadow-lg py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    onAddItem();
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-neutral-100 transition-colors"
                >
                  Add Item
                </button>
                <button
                  onClick={() => {
                    onAddGroup();
                    setShowAddMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-neutral-100 transition-colors"
                >
                  Add Group
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 space-y-3 min-h-[200px]">
        {!hasContent ? (
          <p className="text-body-sm text-neutral-400 text-center py-8">
            No items yet. Click + to add one.
          </p>
        ) : (
          renderNodes()
        )}
      </div>
    </div>
  );
};
