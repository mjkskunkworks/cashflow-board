export type BucketType = "IN" | "OUT" | "HOLDING";

export type CashflowItemColor = 
  | "blue" 
  | "green" 
  | "purple" 
  | "orange" 
  | "pink" 
  | "teal" 
  | "red" 
  | "yellow";

export const COLOR_OPTIONS: { value: CashflowItemColor; label: string; hex: string }[] = [
  { value: "blue", label: "Blue", hex: "#3B82F6" },
  { value: "green", label: "Green", hex: "#10B981" },
  { value: "purple", label: "Purple", hex: "#8B5CF6" },
  { value: "orange", label: "Orange", hex: "#F97316" },
  { value: "pink", label: "Pink", hex: "#EC4899" },
  { value: "teal", label: "Teal", hex: "#14B8A6" },
  { value: "red", label: "Red", hex: "#EF4444" },
  { value: "yellow", label: "Yellow", hex: "#EAB308" },
];

export interface CashflowItem {
  id: string;
  title: string;
  amount: number;
  bucket: BucketType;
  color: CashflowItemColor;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string | null;
}

export interface CashflowItemDraft {
  title: string;
  amount: number;
  bucket: BucketType;
  color: CashflowItemColor;
}

export interface DragState {
  draggedItem: CashflowItem | null;
  sourceBucket: BucketType | null;
}
