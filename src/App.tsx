import React, { useState, useMemo, useEffect } from "react";
import { TotalDisplay } from "./components/TotalDisplay";
import { BucketPanel } from "./components/BucketPanel";
import { ItemModal } from "./components/ItemModal";
import { DeleteModal } from "./components/DeleteModal";
import { CashflowItem, BucketType, DragState, CashflowItemColor, CashflowMode, DisplayPeriod, Frequency } from "./types";
import { getActiveAmountForMath } from "./lib/utils";

// Migration function
function migrateItem(item: any): CashflowItem {
  let migrated: any = { ...item };
  
  // Migrate amount field to realAmount/whatIfAmount
  if ('realAmount' in item || 'whatIfAmount' in item) {
    // Ensure both fields exist
    migrated.realAmount = item.realAmount ?? null;
    migrated.whatIfAmount = item.whatIfAmount ?? null;
  } else if ('amount' in item && typeof item.amount === 'number') {
    const { amount, ...rest } = item;
    migrated = {
      ...rest,
      realAmount: amount,
      whatIfAmount: null,
    };
  } else {
    migrated.realAmount = migrated.realAmount ?? null;
    migrated.whatIfAmount = migrated.whatIfAmount ?? null;
  }
  
  // Migrate frequency field - default to "M" if missing
  if (!migrated.frequency || !['D', 'W', 'M', 'Q', 'Y'].includes(migrated.frequency)) {
    migrated.frequency = 'M' as Frequency;
  }
  
  return migrated as CashflowItem;
}

function App() {
  const [items, setItems] = useState<CashflowItem[]>(() => {
    try {
      const saved = localStorage.getItem("cashflow-items");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate items on load
        return Array.isArray(parsed) ? parsed.map(migrateItem) : [];
      }
      return [];
    } catch {
      return [];
    }
  });  

  const [mode, setMode] = useState<CashflowMode>(() => {
    try {
      const saved = localStorage.getItem("cashflow-mode");
      return (saved === "REAL" || saved === "WHAT IF") ? saved : "REAL";
    } catch {
      return "REAL";
    }
  });

  const [displayPeriod, setDisplayPeriod] = useState<DisplayPeriod>(() => {
    try {
      const saved = localStorage.getItem("cashflow-display-period");
      return (saved === "D" || saved === "W" || saved === "M" || saved === "Q" || saved === "Y") 
        ? saved as DisplayPeriod 
        : "M";
    } catch {
      return "M";
    }
  });

  useEffect(() => {
    localStorage.setItem("cashflow-items", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("cashflow-mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("cashflow-display-period", displayPeriod);
  }, [displayPeriod]);
  

  const createItem = (item: Omit<CashflowItem, "id" | "createdAt" | "updatedAt" | "createdByUserId" | "amount">) => {
    const now = new Date();
    const newItem: CashflowItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: null,
    };
    setItems((prev) => {
      // Find the index of the last item in the target bucket
      let insertIndex = prev.length;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].bucket === item.bucket) {
          insertIndex = i + 1;
          break;
        }
      }
      // If no items in target bucket found, append at the end
      // This will make it appear at the bottom when filtered by bucket
      return [
        ...prev.slice(0, insertIndex),
        newItem,
        ...prev.slice(insertIndex),
      ];
    });
  };

  const updateItem = (id: string, patch: Partial<CashflowItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    sourceBucket: null,
  });
  
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    bucket: BucketType | null;
    editingItem: CashflowItem | null;
  }>({
    isOpen: false,
    bucket: null,
    editingItem: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    itemId: string | null;
  }>({
    isOpen: false,
    itemId: null,
  });

  const [dragOverBucket, setDragOverBucket] = useState<BucketType | null>(null);

  const getItemsByBucket = (bucket: BucketType): CashflowItem[] => {
    if (!items) return [];
    return items.filter((item) => item.bucket === bucket);
  };

  const netTotal = useMemo(() => {
    if (!items) return 0;
    const inTotal = items
      .filter((item) => item.bucket === "IN")
      .reduce((sum, item) => sum + getActiveAmountForMath(item, mode, displayPeriod), 0);
    const outTotal = items
      .filter((item) => item.bucket === "OUT")
      .reduce((sum, item) => sum + getActiveAmountForMath(item, mode, displayPeriod), 0);
    return inTotal - outTotal;
  }, [items, mode, displayPeriod]);

  const handleAddClick = (bucket: BucketType) => {
    setModalState({
      isOpen: true,
      bucket,
      editingItem: null,
    });
  };

  const handleEditItem = (item: CashflowItem) => {
    setModalState({
      isOpen: true,
      bucket: item.bucket,
      editingItem: item,
    });
  };

  const handleModalSave = (
    title: string, 
    realAmount: number | null, 
    whatIfAmount: number | null,
    frequency: Frequency,
    color: CashflowItemColor
  ) => {
    try {
      if (modalState.editingItem) {
        updateItem(modalState.editingItem.id, { title, realAmount, whatIfAmount, frequency, color });
      } else if (modalState.bucket) {
        createItem({ title, realAmount, whatIfAmount, frequency, bucket: modalState.bucket, color });
      }
      setModalState({ isOpen: false, bucket: null, editingItem: null });
    } catch (err) {
      console.error("Failed to save item:", err);
    }
  };


  const handleModalDelete = () => {
    if (modalState.editingItem) {
      setDeleteModalState({
        isOpen: true,
        itemId: modalState.editingItem.id,
      });
      setModalState({ isOpen: false, bucket: null, editingItem: null });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModalState.itemId) {
      try {
        removeItem(deleteModalState.itemId);
      } catch (err) {
        console.error("Failed to delete item:", err);
      }
    }
    setDeleteModalState({ isOpen: false, itemId: null });
  };


  const handleDragStart = (item: CashflowItem) => {
    setDragState({
      draggedItem: item,
      sourceBucket: item.bucket as BucketType,
    });
  };

  const handleDragEnd = () => {
    setDragState({
      draggedItem: null,
      sourceBucket: null,
    });
    setDragOverBucket(null);
    setDragOverItemId(null);
  };

  const handleDragOver = (e: React.DragEvent, bucket: BucketType) => {
    e.preventDefault();
    setDragOverBucket(bucket);
  };

  const handleDrop = (e: React.DragEvent, targetBucket: BucketType, targetItemId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedItem = dragState.draggedItem;
    if (!draggedItem) {
      setDragOverBucket(null);
      setDragOverItemId(null);
      return;
    }

    try {
      setItems((prev) => {
        const isSameBucket = draggedItem.bucket === targetBucket;
        const needsBucketChange = !isSameBucket;
        const updatedItem: CashflowItem = needsBucketChange 
          ? { ...draggedItem, bucket: targetBucket }
          : draggedItem;
        
        // Remove the dragged item first
        const withoutDragged = prev.filter((item) => item.id !== draggedItem.id);
        
        let insertIndex: number;
        
        if (targetItemId) {
          // Dropping on a specific item - find its position in the array after removal and insert before it
          const targetIndex = withoutDragged.findIndex((item) => item.id === targetItemId && item.bucket === targetBucket);
          if (targetIndex >= 0) {
            insertIndex = targetIndex;
          } else {
            // Target not found in target bucket - add to bottom of target bucket
            insertIndex = withoutDragged.length;
            for (let i = withoutDragged.length - 1; i >= 0; i--) {
              if (withoutDragged[i].bucket === targetBucket) {
                insertIndex = i + 1;
                break;
              }
            }
          }
        } else {
          // Dropping on bucket panel (empty area) - add to bottom of target bucket
          insertIndex = withoutDragged.length;
          for (let i = withoutDragged.length - 1; i >= 0; i--) {
            if (withoutDragged[i].bucket === targetBucket) {
              insertIndex = i + 1;
              break;
            }
          }
        }
        
        return [
          ...withoutDragged.slice(0, insertIndex),
          updatedItem,
          ...withoutDragged.slice(insertIndex),
        ];
      });
    } catch (err) {
      console.error("Failed to move item:", err);
    }
    
    setDragOverBucket(null);
    setDragOverItemId(null);
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <TotalDisplay 
          total={netTotal} 
          mode={mode} 
          onModeChange={setMode}
          displayPeriod={displayPeriod}
          onDisplayPeriodChange={setDisplayPeriod}
        />
        
        <main className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr] gap-6">
            <BucketPanel
              title="IN"
              items={getItemsByBucket("IN")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAdd={() => handleAddClick("IN")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, itemId) => handleDrop(e, "IN", itemId)}
              onDragOver={(e) => handleDragOver(e, "IN")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              isDragOver={dragOverBucket === "IN"}
              dragOverItemId={dragOverItemId}
              draggedItemId={dragState.draggedItem?.id || null}
            />
            
            <BucketPanel
              title="OUT"
              items={getItemsByBucket("OUT")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAdd={() => handleAddClick("OUT")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, itemId) => handleDrop(e, "OUT", itemId)}
              onDragOver={(e) => handleDragOver(e, "OUT")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              isDragOver={dragOverBucket === "OUT"}
              dragOverItemId={dragOverItemId}
              draggedItemId={dragState.draggedItem?.id || null}
            />
            
            <BucketPanel
              title="HOLDING"
              items={getItemsByBucket("HOLDING")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAdd={() => handleAddClick("HOLDING")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, itemId) => handleDrop(e, "HOLDING", itemId)}
              onDragOver={(e) => handleDragOver(e, "HOLDING")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              isDragOver={dragOverBucket === "HOLDING"}
              dragOverItemId={dragOverItemId}
              draggedItemId={dragState.draggedItem?.id || null}
            />
          </div>
        </main>
      </div>

      <ItemModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, bucket: null, editingItem: null })}
        onSave={handleModalSave}
        onDelete={modalState.editingItem ? handleModalDelete : undefined}
        initialData={modalState.editingItem}
        displayPeriod={displayPeriod}
      />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalState({ isOpen: false, itemId: null })}
      />
    </div>
  );
}

export default App;
