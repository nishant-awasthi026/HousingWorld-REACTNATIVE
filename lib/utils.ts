/**
 * Format a price number into a readable Indian currency string.
 * e.g. 10000000 → "₹1.00 Cr", 500000 → "₹5.00 L", 50000 → "₹50,000"
 */
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};
