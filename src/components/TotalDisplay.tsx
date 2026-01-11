import { useFormattedCurrency } from "../hooks/useFormattedCurrency";
import { CashflowMode, DisplayPeriod } from "../types";
import { Switch } from "./ui/switch";

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
  
  const totalColor = total >= 0 ? "#0BB77F" : "#EF4444"; // Green for positive, red for negative
  const isWhatIfMode = mode === "WHAT IF";

  return (
    <header className="flex flex-col items-center justify-center py-8 px-6">
      <div 
        className="w-full max-w-[500px] rounded-[10px] border border-neutral-200"
        style={{
          background: isWhatIfMode 
            ? 'linear-gradient(to bottom, rgba(242, 242, 246, 0.5), rgba(189, 162, 251, 0.5))'
            : '#FFFFFF',
          padding: '32px 24px',
        }}
      >
        {/* "net total" label */}
        <h1 
          className="text-center mb-6"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            fontWeight: 400,
            color: '#18191B',
            letterSpacing: '0%',
          }}
        >
          net total
        </h1>

        {/* Monetary value */}
        <div
          className="text-center mb-6"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '60px',
            fontWeight: 700,
            color: totalColor,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatCurrency(total)}
        </div>

        {/* Real/What-If toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: !isWhatIfMode ? 500 : 400,
              color: !isWhatIfMode ? '#18191B' : '#ABB2C0',
            }}
          >
            real
          </span>
          <Switch
            checked={isWhatIfMode}
            onCheckedChange={(checked) => onModeChange(checked ? "WHAT IF" : "REAL")}
          />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: isWhatIfMode ? 500 : 400,
              color: isWhatIfMode ? '#18191B' : '#ABB2C0',
            }}
          >
            what-if
          </span>
        </div>

        {/* Time period selector */}
        <div className="flex items-center justify-center gap-0">
          {DISPLAY_PERIOD_OPTIONS.map((period, index) => (
            <button
              key={period}
              onClick={() => onDisplayPeriodChange(period)}
              className="focus:outline-none transition-all duration-fast"
              style={{
                width: '36px',
                height: '30px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                borderRadius: index === 0 
                  ? '10px 0 0 10px' 
                  : index === DISPLAY_PERIOD_OPTIONS.length - 1
                  ? '0 10px 10px 0'
                  : '0',
                backgroundColor: displayPeriod === period ? '#18191B' : 'transparent',
                color: displayPeriod === period ? '#F3F3FF' : '#18191B',
                border: `1px solid ${displayPeriod === period ? '#18191B' : '#ABB2C0'}`,
                borderRight: index < DISPLAY_PERIOD_OPTIONS.length - 1 ? 'none' : `1px solid ${displayPeriod === period ? '#18191B' : '#ABB2C0'}`,
                cursor: 'pointer',
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
