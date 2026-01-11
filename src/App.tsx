import React, { useState, useMemo, useEffect } from "react";
import { TotalDisplay } from "./components/TotalDisplay";
import { BucketPanel } from "./components/BucketPanel";
import { ItemModal } from "./components/ItemModal";
import { GroupModal } from "./components/GroupModal";
import { DeleteModal } from "./components/DeleteModal";
import { CashflowItem, CashflowGroup, CashflowNode, BucketType, DragState, CashflowItemColor, CashflowMode, DisplayPeriod, Frequency } from "./types";
import { getActiveAmountForMath } from "./lib/utils";

// Migration function
function migrateNode(node: any): CashflowNode {
  // If it's already a group, ensure it has all required fields
  if (node.type === "GROUP") {
    return {
      ...node,
      id: node.id || crypto.randomUUID(),
      type: "GROUP" as const,
      isExpanded: typeof node.isExpanded === 'boolean' ? node.isExpanded : true,
      createdAt: node.createdAt || new Date(),
      updatedAt: node.updatedAt || new Date(),
      createdByUserId: node.createdByUserId ?? null,
    } as CashflowGroup;
  }
  
  // Otherwise, it's an item (legacy or new format)
  let migrated: any = { ...node };
  
  // Set type to ITEM if not present
  if (!migrated.type) {
    migrated.type = "ITEM";
  }
  
  // Migrate amount field to realAmount/whatIfAmount
  if ('realAmount' in node || 'whatIfAmount' in node) {
    // Ensure both fields exist
    migrated.realAmount = node.realAmount ?? null;
    migrated.whatIfAmount = node.whatIfAmount ?? null;
  } else if ('amount' in node && typeof node.amount === 'number') {
    const { amount, ...rest } = node;
    migrated = {
      ...rest,
      type: "ITEM",
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
  
  // Migrate isEstimate field - default to false if missing
  if (typeof migrated.isEstimate !== 'boolean') {
    migrated.isEstimate = false;
  }
  
  // Migrate whatIfNote field - default to null/empty string if missing
  if (migrated.whatIfNote == null || migrated.whatIfNote === undefined) {
    migrated.whatIfNote = null;
  }
  
  // Migrate groupId field - default to null if missing
  if (!('groupId' in migrated)) {
    migrated.groupId = null;
  }
  
  return migrated as CashflowItem;
}

function App() {
  const [nodes, setNodes] = useState<CashflowNode[]>(() => {
    try {
      const saved = localStorage.getItem("cashflow-items");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate nodes on load (items and groups)
        return Array.isArray(parsed) ? parsed.map(migrateNode) : [];
      }
      return [];
    } catch {
      return [];
    }
  });
  
  // Helper functions to get items and groups separately
  const items = useMemo(() => nodes.filter((node): node is CashflowItem => node.type === "ITEM"), [nodes]);
  const groups = useMemo(() => nodes.filter((node): node is CashflowGroup => node.type === "GROUP"), [nodes]);  

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
    localStorage.setItem("cashflow-items", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("cashflow-mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("cashflow-display-period", displayPeriod);
  }, [displayPeriod]);
  

  const createItem = (item: Omit<CashflowItem, "id" | "type" | "createdAt" | "updatedAt" | "createdByUserId" | "amount"> & { groupId?: string | null }) => {
    const now = new Date();
    const newItem: CashflowItem = {
      ...item,
      type: "ITEM",
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: null,
    };
    setNodes((prev) => {
      // Find the index of the last node in the target bucket (groups or items)
      let insertIndex = prev.length;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].bucket === item.bucket) {
          insertIndex = i + 1;
          break;
        }
      }
      return [
        ...prev.slice(0, insertIndex),
        newItem,
        ...prev.slice(insertIndex),
      ];
    });
  };

  const createGroup = (group: Omit<CashflowGroup, "id" | "type" | "createdAt" | "updatedAt" | "createdByUserId">) => {
    const now = new Date();
    const newGroup: CashflowGroup = {
      ...group,
      type: "GROUP",
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      createdByUserId: null,
    };
    setNodes((prev) => {
      // Find the index of the last node in the target bucket
      let insertIndex = prev.length;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].bucket === group.bucket) {
          insertIndex = i + 1;
          break;
        }
      }
      return [
        ...prev.slice(0, insertIndex),
        newGroup,
        ...prev.slice(insertIndex),
      ];
    });
  };

  const updateItem = (id: string, patch: Partial<CashflowItem>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id && node.type === "ITEM" ? { ...node, ...patch, updatedAt: new Date() } : node))
    );
  };

  const updateGroup = (id: string, patch: Partial<CashflowGroup>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id && node.type === "GROUP" ? { ...node, ...patch, updatedAt: new Date() } : node))
    );
  };

  const toggleGroupExpanded = (id: string) => {
    setNodes((prev) =>
      prev.map((node) => 
        node.id === id && node.type === "GROUP" 
          ? { ...node, isExpanded: !node.isExpanded, updatedAt: new Date() }
          : node
      )
    );
  };

  const removeItem = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id || node.type !== "ITEM"));
  };

  const removeGroup = (id: string) => {
    setNodes((prev) => {
      // First, ungroup all items that belong to this group
      const ungroupedItems = prev.map((node) => 
        node.type === "ITEM" && node.groupId === id 
          ? { ...node, groupId: null as string | null }
          : node
      );
      // Then remove the group
      return ungroupedItems.filter((node) => !(node.id === id && node.type === "GROUP"));
    });
  };

  const [dragState, setDragState] = useState<DragState>({
    draggedNode: null,
    sourceBucket: null,
    draggedType: null,
  });
  
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragInsertBeforeId, setDragInsertBeforeId] = useState<string | null>(null); // For divider line indicator

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    bucket: BucketType | null;
    editingItem: CashflowItem | null;
  }>({
    isOpen: false,
    bucket: null,
    editingItem: null,
  });

  const [groupModalState, setGroupModalState] = useState<{
    isOpen: boolean;
    bucket: BucketType | null;
    editingGroup: CashflowGroup | null;
  }>({
    isOpen: false,
    bucket: null,
    editingGroup: null,
  });

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    itemId: string | null;
    groupId: string | null;
  }>({
    isOpen: false,
    itemId: null,
    groupId: null,
  });

  const [dragOverBucket, setDragOverBucket] = useState<BucketType | null>(null);

  // Get nodes by bucket
  const getTopLevelNodesByBucket = (bucket: BucketType): CashflowNode[] => {
    // Return all top-level nodes (items with groupId=null and groups) in their actual order from the nodes array
    return nodes.filter((node) => 
      node.bucket === bucket && 
      (node.type === "GROUP" || (node.type === "ITEM" && node.groupId === null))
    );
  };

  // These functions are kept for backward compatibility but are no longer used
  // The new getTopLevelNodesByBucket returns nodes in their actual order
  // const getTopLevelItemsByBucket = (bucket: BucketType): CashflowItem[] => {
  //   return items.filter((item) => item.bucket === bucket && item.groupId === null);
  // };

  // const getTopLevelGroupsByBucket = (bucket: BucketType): CashflowGroup[] => {
  //   return groups.filter((group) => group.bucket === bucket);
  // };

  const getAllItemsByBucket = (bucket: BucketType): CashflowItem[] => {
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

  const handleAddItemClick = (bucket: BucketType) => {
    setModalState({
      isOpen: true,
      bucket,
      editingItem: null,
    });
  };

  const handleAddGroupClick = (bucket: BucketType) => {
    setGroupModalState({
      isOpen: true,
      bucket,
      editingGroup: null,
    });
  };

  const handleEditItem = (item: CashflowItem) => {
    setModalState({
      isOpen: true,
      bucket: item.bucket,
      editingItem: item,
    });
  };

  const handleEditGroup = (group: CashflowGroup) => {
    setGroupModalState({
      isOpen: true,
      bucket: group.bucket,
      editingGroup: group,
    });
  };

  const handleModalSave = (
    title: string, 
    realAmount: number | null, 
    whatIfAmount: number | null,
    frequency: Frequency,
    isEstimate: boolean,
    whatIfNote: string | null,
    color: CashflowItemColor
  ) => {
    try {
      if (modalState.editingItem) {
        updateItem(modalState.editingItem.id, { title, realAmount, whatIfAmount, frequency, isEstimate, whatIfNote, color });
      } else if (modalState.bucket) {
        createItem({ title, realAmount, whatIfAmount, frequency, isEstimate, whatIfNote, bucket: modalState.bucket, color, groupId: null });
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
        groupId: null,
      });
      setModalState({ isOpen: false, bucket: null, editingItem: null });
    }
  };

  const handleGroupModalDelete = () => {
    if (groupModalState.editingGroup) {
      setDeleteModalState({
        isOpen: true,
        itemId: null,
        groupId: groupModalState.editingGroup.id,
      });
      setGroupModalState({ isOpen: false, bucket: null, editingGroup: null });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteModalState.itemId) {
      try {
        removeItem(deleteModalState.itemId);
      } catch (err) {
        console.error("Failed to delete item:", err);
      }
    } else if (deleteModalState.groupId) {
      try {
        removeGroup(deleteModalState.groupId);
      } catch (err) {
        console.error("Failed to delete group:", err);
      }
    }
    setDeleteModalState({ isOpen: false, itemId: null, groupId: null });
  };


  const handleDragStart = (node: CashflowNode) => {
    setDragState({
      draggedNode: node,
      sourceBucket: node.bucket as BucketType,
      draggedType: node.type,
    });
  };

  const handleDragEnd = () => {
    setDragState({
      draggedNode: null,
      sourceBucket: null,
      draggedType: null,
    });
    setDragOverBucket(null);
    setDragOverItemId(null);
    setDragOverGroupId(null);
    setDragInsertBeforeId(null);
  };

  const handleDragOver = (e: React.DragEvent, bucket: BucketType) => {
    e.preventDefault();
    setDragOverBucket(bucket);
  };

  const handleDrop = (e: React.DragEvent, targetBucket: BucketType, targetNodeId?: string, targetGroupId?: string | null, insertBeforeId?: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedNode = dragState.draggedNode;
    if (!draggedNode) {
      setDragOverBucket(null);
      setDragOverItemId(null);
      setDragOverGroupId(null);
      setDragInsertBeforeId(null);
      return;
    }

    try {
      setNodes((prev) => {
        if (draggedNode.type === "ITEM") {
          const draggedItem = draggedNode;
          // Handle item drop
          const updatedItem: CashflowItem = {
            ...draggedItem,
            bucket: targetBucket,
            groupId: targetGroupId ?? null,
          };
          
          // Remove the dragged item first
          const withoutDragged = prev.filter((node) => node.id !== draggedItem.id);
          
          // If dropping on a group (adding to group), update groupId and bucket, then insert at end
          // But if insertBeforeId is provided, we're reordering (even within a group), so skip this
          if (targetGroupId && !insertBeforeId) {
            const updatedNodes = withoutDragged.map((node) => 
              node.id === draggedItem.id ? updatedItem : node
            );
            // Add updated item at the end (position doesn't matter for grouped items)
            return [...updatedNodes, updatedItem];
          }
          
          let insertIndex: number;
          
          // Use insertBeforeId if provided (from divider line), otherwise use targetNodeId
          const targetId = insertBeforeId ?? targetNodeId;
          
          if (targetId) {
            // Dropping on a specific node - find its position in the array after removal and insert before it
            const targetIndex = withoutDragged.findIndex((node) => node.id === targetId && node.bucket === targetBucket);
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
        } else {
          // Handle group drop - move group and all its children
          const draggedGroup = draggedNode;
          // Don't allow dropping a group onto another group (targetGroupId should be ignored for groups)
          const updatedGroup: CashflowGroup = {
            ...draggedGroup,
            bucket: targetBucket,
          };
          
          // Remove the dragged group first
          let withoutDragged = prev.filter((node) => node.id !== draggedGroup.id);
          
          // Update all child items to match the new bucket
          withoutDragged = withoutDragged.map((node) => 
            node.type === "ITEM" && node.groupId === draggedGroup.id
              ? { ...node, bucket: targetBucket }
              : node
          );
          
          let insertIndex: number;
          
          // Use insertBeforeId if provided (from divider line), otherwise use targetNodeId
          const targetId = insertBeforeId ?? targetNodeId;
          
          if (targetId && targetId !== draggedGroup.id) {
            const targetIndex = withoutDragged.findIndex((node) => node.id === targetId && node.bucket === targetBucket);
            if (targetIndex >= 0) {
              insertIndex = targetIndex;
            } else {
              insertIndex = withoutDragged.length;
              for (let i = withoutDragged.length - 1; i >= 0; i--) {
                if (withoutDragged[i].bucket === targetBucket) {
                  insertIndex = i + 1;
                  break;
                }
              }
            }
          } else {
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
            updatedGroup,
            ...withoutDragged.slice(insertIndex),
          ];
        }
      });
    } catch (err) {
      console.error("Failed to move node:", err);
    }
    
    setDragOverBucket(null);
    setDragOverItemId(null);
    setDragOverGroupId(null);
    setDragInsertBeforeId(null);
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
                      topLevelNodes={getTopLevelNodesByBucket("IN")}
                      allItems={getAllItemsByBucket("IN")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAddItem={() => handleAddItemClick("IN")}
              onAddGroup={() => handleAddGroupClick("IN")}
              onEditItem={handleEditItem}
              onEditGroup={handleEditGroup}
              onToggleGroup={toggleGroupExpanded}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, targetNodeId, targetGroupId, insertBeforeId) => handleDrop(e, "IN", targetNodeId, targetGroupId, insertBeforeId)}
              onDragOver={(e) => handleDragOver(e, "IN")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              onGroupDragOver={(groupId) => setDragOverGroupId(groupId)}
              onInsertBefore={(nodeId) => setDragInsertBeforeId(nodeId)}
              isDragOver={dragOverBucket === "IN"}
              dragOverItemId={dragOverItemId}
              dragOverGroupId={dragOverGroupId}
              draggedNodeId={dragState.draggedNode?.id || null}
              draggedType={dragState.draggedType}
              dragInsertBeforeId={dragInsertBeforeId}
            />
            
                    <BucketPanel
                      title="OUT"
                      topLevelNodes={getTopLevelNodesByBucket("OUT")}
                      allItems={getAllItemsByBucket("OUT")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAddItem={() => handleAddItemClick("OUT")}
              onAddGroup={() => handleAddGroupClick("OUT")}
              onEditItem={handleEditItem}
              onEditGroup={handleEditGroup}
              onToggleGroup={toggleGroupExpanded}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, targetNodeId, targetGroupId) => handleDrop(e, "OUT", targetNodeId, targetGroupId)}
              onDragOver={(e) => handleDragOver(e, "OUT")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              onGroupDragOver={(groupId) => setDragOverGroupId(groupId)}
              onInsertBefore={(nodeId) => setDragInsertBeforeId(nodeId)}
              isDragOver={dragOverBucket === "OUT"}
              dragOverItemId={dragOverItemId}
              dragOverGroupId={dragOverGroupId}
              draggedNodeId={dragState.draggedNode?.id || null}
              draggedType={dragState.draggedType}
              dragInsertBeforeId={dragInsertBeforeId}
            />
            
                    <BucketPanel
                      title="HOLDING"
                      topLevelNodes={getTopLevelNodesByBucket("HOLDING")}
                      allItems={getAllItemsByBucket("HOLDING")}
              mode={mode}
              displayPeriod={displayPeriod}
              onAddItem={() => handleAddItemClick("HOLDING")}
              onAddGroup={() => handleAddGroupClick("HOLDING")}
              onEditItem={handleEditItem}
              onEditGroup={handleEditGroup}
              onToggleGroup={toggleGroupExpanded}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(e, targetNodeId, targetGroupId) => handleDrop(e, "HOLDING", targetNodeId, targetGroupId)}
              onDragOver={(e) => handleDragOver(e, "HOLDING")}
              onItemDragOver={(itemId) => setDragOverItemId(itemId)}
              onGroupDragOver={(groupId) => setDragOverGroupId(groupId)}
              onInsertBefore={(nodeId) => setDragInsertBeforeId(nodeId)}
              isDragOver={dragOverBucket === "HOLDING"}
              dragOverItemId={dragOverItemId}
              dragOverGroupId={dragOverGroupId}
              draggedNodeId={dragState.draggedNode?.id || null}
              draggedType={dragState.draggedType}
              dragInsertBeforeId={dragInsertBeforeId}
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

      <GroupModal
        isOpen={groupModalState.isOpen}
        onClose={() => setGroupModalState({ isOpen: false, bucket: null, editingGroup: null })}
        onSave={(name, color) => {
          if (groupModalState.editingGroup) {
            updateGroup(groupModalState.editingGroup.id, { name, color });
          } else if (groupModalState.bucket) {
            createGroup({ name, color, bucket: groupModalState.bucket, isExpanded: true });
          }
          setGroupModalState({ isOpen: false, bucket: null, editingGroup: null });
        }}
        onDelete={groupModalState.editingGroup ? handleGroupModalDelete : undefined}
        initialData={groupModalState.editingGroup}
      />

      <DeleteModal
        isOpen={deleteModalState.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalState({ isOpen: false, itemId: null, groupId: null })}
        title={deleteModalState.groupId ? "Delete this group?" : "Delete this item?"}
      />
    </div>
  );
}

export default App;
