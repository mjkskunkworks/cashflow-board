import { useFormattedCurrency } from "../hooks/useFormattedCurrency";

interface TotalDisplayProps {
  total: number;
}

export const TotalDisplay = ({ total }: TotalDisplayProps) => {
  const { formatCurrency } = useFormattedCurrency();
  
  const totalColor = total >= 0 ? "text-success" : "text-error";

  return (
    <header className="flex flex-col items-center justify-center py-8 px-6">
      <h1 className="text-body-sm font-medium text-muted-foreground mb-2">
        Net Total
      </h1>
      <div
        className={`text-h1 font-mono transition-colors duration-normal ${totalColor}`}
        style={{ fontWeight: 700 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {formatCurrency(total)}
      </div>
    </header>
  );
};
