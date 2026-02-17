import { useState, useEffect, Fragment } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { BucketType, CashflowItem, CashflowGroup, CashflowNode, CashflowMode, DisplayPeriod } from "../types";
import { BucketPanel } from "./BucketPanel";
import { ItemCard } from "./ItemCard";
import { GroupCard } from "./GroupCard";

// Configuration: Change this to "right" to test right-side drawer
const DRAWER_POSITION: "bottom" | "right" = "bottom";

interface HoldingDrawerProps {
  topLevelNodes: CashflowNode[];
  allItems: CashflowItem[];
  mode: CashflowMode;
  displayPeriod: DisplayPeriod;
  onAddItem: (bucket?: BucketType, groupId?: string | null) => void;
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

export const HoldingDrawer = ({
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
}: HoldingDrawerProps) => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("holding-drawer-open");
      return saved === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("holding-drawer-open", isOpen.toString());
  }, [isOpen]);

  const isBottom = DRAWER_POSITION === "bottom";

  // Toggle button positioning
  const toggleButtonClasses = isBottom
    ? "fixed bottom-4 right-6 z-50"
    : "fixed top-1/2 right-0 -translate-y-1/2 z-50 translate-x-0";

  // Drawer container classes
  const drawerContainerClasses = isBottom
    ? `fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-neutral-200 shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`
    : `fixed top-0 right-0 bottom-0 z-40 bg-background border-l border-neutral-200 shadow-lg transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`;

  // Drawer content classes
  const drawerContentClasses = isBottom
    ? "max-h-[60vh] overflow-y-auto p-6"
    : "w-[400px] h-full overflow-y-auto p-6";

  // Toggle button icon
  const ToggleIcon = isBottom
    ? isOpen
      ? ChevronDown
      : ChevronUp
    : isOpen
    ? ChevronRight
    : ChevronLeft;

  return (
    <>
      {/* Toggle Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${toggleButtonClasses} bg-neutral-100 text-neutral-600 border border-neutral-300 hover:bg-neutral-200 hover:text-neutral-700 h-10 px-4 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2 shadow-md`}
        aria-label={isOpen ? "Close Holding drawer" : "Open Holding drawer"}
      >
        <span className="text-body-sm font-medium">HOLDING</span>
        <ToggleIcon className="w-4 h-4" strokeWidth={1.75} />
      </button>

      {/* Drawer */}
      <div className={drawerContainerClasses}>
        <div className={drawerContentClasses}>
          {isBottom ? (
            // Bottom drawer: Responsive grid layout
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3 font-semibold text-foreground">HOLDING</h2>
                <button
                  onClick={() => onAddItem("HOLDING")}
                  className="bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200 hover:text-neutral-600 h-8 w-8 p-0 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
                  aria-label="Add to HOLDING"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}
                onDrop={(e) => onDrop(e)}
                onDragOver={onDragOver}
              >
                {topLevelNodes.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-body-sm text-neutral-400">
                      No items yet. Click + to add one.
                    </p>
                  </div>
                ) : (
                  topLevelNodes.map((node) => {
                    if (node.type === "GROUP") {
                      const group = node;
                      const childItems = allItems.filter((item) => item.groupId === group.id);
                      return (
                        <Fragment key={group.id}>
                          {/* Divider line before group */}
                          {dragInsertBeforeId === group.id && draggedNodeId && draggedNodeId !== group.id && (
                            <div className="col-span-full h-0.5 bg-primary -my-1.5 z-10" />
                          )}
                          <div className="contents">
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
                                  if (draggedType === "GROUP") {
                                    onInsertBefore(group.id);
                                  } else {
                                    onGroupDragOver(group.id);
                                  }
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedType === "GROUP") {
                                  onDrop(e, group.id, null, dragInsertBeforeId);
                                } else {
                                  onDrop(e, group.id, group.id, null);
                                }
                              }}
                              isDragOver={dragOverGroupId === group.id && draggedNodeId !== group.id}
                            />
                            {/* Render child items and plus button if group is expanded */}
                            {group.isExpanded && (
                              <>
                                {childItems.map((item) => (
                                  <Fragment key={item.id}>
                                    {dragInsertBeforeId === item.id && draggedNodeId && draggedNodeId !== item.id && (
                                      <div className="col-span-full h-0.5 bg-primary -my-1.5 z-10" />
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
                                          onInsertBefore(item.id);
                                        }
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDrop(e, item.id, item.groupId, dragInsertBeforeId);
                                      }}
                                      isDragOver={dragOverItemId === item.id && draggedNodeId !== item.id}
                                    />
                                  </Fragment>
                                ))}
                                {/* Plus button to add item to group */}
                                <div className="col-span-full flex justify-center">
                                  <button
                                    onClick={() => onAddItem("HOLDING", group.id)}
                                    className="bg-neutral-100 text-neutral-500 border border-neutral-300 hover:bg-neutral-200 hover:text-neutral-600 h-8 w-8 p-0 rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center justify-center"
                                    aria-label="Add item to group"
                                  >
                                    <Plus className="w-4 h-4" strokeWidth={1.75} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </Fragment>
                      );
                    } else {
                      // node.type === "ITEM" (top-level item)
                      const item = node;
                      return (
                        <Fragment key={item.id}>
                          {/* Divider line before item */}
                          {dragInsertBeforeId === item.id && draggedNodeId && draggedNodeId !== item.id && (
                            <div className="col-span-full h-0.5 bg-primary -my-1.5 z-10" />
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
                                onInsertBefore(item.id);
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDrop(e, item.id, null, dragInsertBeforeId);
                            }}
                            isDragOver={false}
                          />
                        </Fragment>
                      );
                    }
                  })
                )}
              </div>
            </div>
          ) : (
            // Right drawer: Single column layout (reuse BucketPanel)
            <BucketPanel
              title="HOLDING"
              topLevelNodes={topLevelNodes}
              allItems={allItems}
              mode={mode}
              displayPeriod={displayPeriod}
              onAddItem={onAddItem}
              onAddGroup={onAddGroup}
              onEditItem={onEditItem}
              onEditGroup={onEditGroup}
              onToggleGroup={onToggleGroup}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onItemDragOver={onItemDragOver}
              onGroupDragOver={onGroupDragOver}
              onInsertBefore={onInsertBefore}
              isDragOver={isDragOver}
              dragOverItemId={dragOverItemId}
              dragOverGroupId={dragOverGroupId}
              draggedNodeId={draggedNodeId}
              draggedType={draggedType}
              dragInsertBeforeId={dragInsertBeforeId}
            />
          )}
        </div>
      </div>
    </>
  );
};

