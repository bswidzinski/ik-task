export function formatPrice(price: number | string): string {
  return `$${Number(price).toFixed(2)}`;
}
