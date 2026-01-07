import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@animaapp/playground-react-sdk";
import { TotalDisplay } from "./components/TotalDisplay";
import { BucketPanel } from "./components/BucketPanel";
import { ItemModal } from "./components/ItemModal";
import { DeleteModal } from "./components/DeleteModal";
import { CashflowItem, BucketType, DragState, CashflowItemColor } from "./types";

function App() {
  const { data: items, isPending, error } = useQuery("CashflowItem", {
    orderBy: { createdAt: "desc" },
  });

  const { create, update, remove, isPending: isMutating } = useMutation("CashflowItem");

  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    sourceBucket: null,
  });

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
      .reduce((sum, item) => sum + item.amount, 0);
    const outTotal = items
      .filter((item) => item.bucket === "OUT")
      .reduce((sum, item) => sum + item.amount, 0);
    return inTotal - outTotal;
  }, [items]);

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

  const handleModalSave = async (title: string, amount: number, color: CashflowItemColor) => {
    try {
      if (modalState.editingItem) {
        await update(modalState.editingItem.id, { title, amount, color });
      } else if (modalState.bucket) {
        await create({ title, amount, bucket: modalState.bucket, color });
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

  const handleDeleteConfirm = async () => {
    if (deleteModalState.itemId) {
      try {
        await remove(deleteModalState.itemId);
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
  };

  const handleDragOver = (e: React.DragEvent, bucket: BucketType) => {
    e.preventDefault();
    setDragOverBucket(bucket);
  };

  const handleDrop = async (e: React.DragEvent, targetBucket: BucketType) => {
    e.preventDefault();
    if (dragState.draggedItem && dragState.draggedItem.bucket !== targetBucket) {
      try {
        await update(dragState.draggedItem.id, { bucket: targetBucket });
      } catch (err) {
        console.error("Failed to move item:", err);
      }
    }
    setDragOverBucket(null);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-error">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <TotalDisplay total={netTotal} />
        
        <main className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr] gap-6">
            <BucketPanel
              title="IN"
              items={getItemsByBucket("IN")}
              onAdd={() => handleAddClick("IN")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, "IN")}
              onDragOver={(e) => handleDragOver(e, "IN")}
              isDragOver={dragOverBucket === "IN"}
            />
            
            <BucketPanel
              title="OUT"
              items={getItemsByBucket("OUT")}
              onAdd={() => handleAddClick("OUT")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, "OUT")}
              onDragOver={(e) => handleDragOver(e, "OUT")}
              isDragOver={dragOverBucket === "OUT"}
            />
            
            <BucketPanel
              title="HOLDING"
              items={getItemsByBucket("HOLDING")}
              onAdd={() => handleAddClick("HOLDING")}
              onEditItem={handleEditItem}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, "HOLDING")}
              onDragOver={(e) => handleDragOver(e, "HOLDING")}
              isDragOver={dragOverBucket === "HOLDING"}
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
