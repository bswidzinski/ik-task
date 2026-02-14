import { useQuery } from '@tanstack/react-query';
import { getLowStockReport } from '@/api/inventory';

export function useLowStockReport(threshold?: number) {
  return useQuery({
    queryKey: ['low-stock-report', threshold],
    queryFn: () => getLowStockReport(threshold),
  });
}
