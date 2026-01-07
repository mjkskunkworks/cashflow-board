export const useFormattedCurrency = () => {
  const formatCurrency = (amount: number): string => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  return { formatCurrency };
};
