export type BucketType = "IN" | "OUT" | "HOLDING";

export type CashflowMode = "REAL" | "WHAT IF";

export type Frequency = "D" | "W" | "M" | "Q" | "Y";

export type DisplayPeriod = "D" | "W" | "M" | "Q" | "Y";

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "D", label: "Day" },
  { value: "W", label: "Week" },
  { value: "M", label: "Month" },
  { value: "Q", label: "Quarter" },
  { value: "Y", label: "Year" },
];

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
  type: "ITEM";
  title: string;
  realAmount: number | null;
  whatIfAmount: number | null;
  frequency: Frequency;
  isEstimate: boolean;
  whatIfNote: string | null;
  bucket: BucketType;
  groupId: string | null;
  color: CashflowItemColor;
  iconName: string | null; // Material Symbols icon name
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string | null;
  // Legacy field for migration - will be removed after migration
  amount?: number;
}

export interface CashflowGroup {
  id: string;
  type: "GROUP";
  name: string;
  bucket: BucketType;
  color: CashflowItemColor;
  iconName: string | null; // Material Symbols icon name
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: string | null;
}

export type CashflowNode = CashflowItem | CashflowGroup;

export interface DragState {
  draggedNode: CashflowNode | null;
  sourceBucket: BucketType | null;
  draggedType: "ITEM" | "GROUP" | null;
}
