export const useFormattedCurrency = () => {
  const formatCurrency = (amount: number): string => {
    const absAmount = Math.abs(amount);
    // Format with commas for thousands
    const formatted = absAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return { formatCurrency };
};
