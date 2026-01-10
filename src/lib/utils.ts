import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CashflowItem, CashflowMode, Frequency, DisplayPeriod } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Frequency normalization helpers
export const PERIODS_PER_YEAR: Record<Frequency | DisplayPeriod, number> = {
  D: 365,
  W: 52,
  M: 12,
  Q: 4,
  Y: 1,
};

export function normalizeAmount(
  baseAmount: number,
  fromPeriod: Frequency,
  toPeriod: DisplayPeriod
): number {
  if (fromPeriod === toPeriod) return baseAmount;
  
  // Convert to yearly value, then to target period
  const yearlyValue = baseAmount * PERIODS_PER_YEAR[fromPeriod];
  return yearlyValue / PERIODS_PER_YEAR[toPeriod];
}

// Helper functions for cashflow amount logic
export function getDisplayAmount(item: CashflowItem, mode: CashflowMode): number | null {
  if (item.realAmount != null && item.whatIfAmount == null) {
    return item.realAmount;
  }
  if (item.realAmount == null && item.whatIfAmount != null) {
    return item.whatIfAmount;
  }
  if (item.realAmount != null && item.whatIfAmount != null) {
    return mode === "REAL" ? item.realAmount : item.whatIfAmount;
  }
  return null;
}

export function shouldIncludeInMath(item: CashflowItem, mode: CashflowMode): boolean {
  const displayAmount = getDisplayAmount(item, mode);
  if (displayAmount == null) return false;
  
  // Special case: what-if-only items excluded in REAL mode
  if (item.realAmount == null && item.whatIfAmount != null && mode === "REAL") {
    return false;
  }
  
  return true;
}

export function getActiveAmountForMath(
  item: CashflowItem,
  mode: CashflowMode,
  displayPeriod: DisplayPeriod
): number {
  if (!shouldIncludeInMath(item, mode)) return 0;
  const baseAmount = getDisplayAmount(item, mode);
  if (baseAmount == null) return 0;
  return normalizeAmount(baseAmount, item.frequency, displayPeriod);
}

export function getNormalizedDisplayAmount(
  item: CashflowItem,
  mode: CashflowMode,
  displayPeriod: DisplayPeriod
): number | null {
  const baseAmount = getDisplayAmount(item, mode);
  if (baseAmount == null) return null;
  return normalizeAmount(baseAmount, item.frequency, displayPeriod);
}

export function isWhatIfDisplayed(item: CashflowItem, mode: CashflowMode): boolean {
  return mode === "WHAT IF" && item.whatIfAmount != null && getDisplayAmount(item, mode) === item.whatIfAmount;
}

export function isDisabled(item: CashflowItem, mode: CashflowMode): boolean {
  return item.realAmount == null && item.whatIfAmount != null && mode === "REAL";
}
