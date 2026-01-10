import { useFormattedCurrency } from "../hooks/useFormattedCurrency";
import { CashflowMode, DisplayPeriod } from "../types";

interface TotalDisplayProps {
  total: number;
  mode: CashflowMode;
  onModeChange: (mode: CashflowMode) => void;
  displayPeriod: DisplayPeriod;
  onDisplayPeriodChange: (period: DisplayPeriod) => void;
}

const DISPLAY_PERIOD_OPTIONS: DisplayPeriod[] = ["D", "W", "M", "Q", "Y"];

export const TotalDisplay = ({ total, mode, onModeChange, displayPeriod, onDisplayPeriodChange }: TotalDisplayProps) => {
  const { formatCurrency } = useFormattedCurrency();
  
  const totalColor = total >= 0 ? "text-success" : "text-error";

  return (
    <header className="flex flex-col items-center justify-center py-8 px-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-body-sm font-medium text-muted-foreground">
          Net Total
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onModeChange("REAL")}
            className={`px-3 py-1 text-body-sm rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              mode === "REAL"
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            REAL
          </button>
          <button
            onClick={() => onModeChange("WHAT IF")}
            className={`px-3 py-1 text-body-sm rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              mode === "WHAT IF"
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            WHAT IF
          </button>
        </div>
      </div>
      <div
        className={`text-h1 font-mono transition-colors duration-normal ${totalColor}`}
        style={{ fontWeight: 700 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatCurrency(total)}
      </div>
      <div className="flex items-center gap-1 mt-4">
        {DISPLAY_PERIOD_OPTIONS.map((period) => (
          <button
            key={period}
            onClick={() => onDisplayPeriodChange(period)}
            className={`px-3 py-1 text-body-sm rounded-md transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              displayPeriod === period
                ? "bg-primary text-primary-foreground font-medium"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </header>
  );
};
