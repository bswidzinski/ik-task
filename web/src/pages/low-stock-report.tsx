import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLowStockReport } from '@/hooks/use-inventory';
import { CATEGORY_LABELS } from '@/types/product';
import type { ProductCategory } from '@/types/product';
import { formatPrice } from '@/lib/format';

function quantityClass(quantity: number): string {
  if (quantity === 0) return 'text-red-600 font-semibold';
  if (quantity <= 2) return 'text-yellow-600 font-medium';
  return '';
}

export function LowStockReportPage() {
  const [threshold, setThreshold] = useState(5);
  const [debouncedThreshold, setDebouncedThreshold] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedThreshold(threshold), 300);
    return () => clearTimeout(timer);
  }, [threshold]);

  const { data: report, isLoading, error, refetch } = useLowStockReport(debouncedThreshold);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-destructive">
          Failed to load report: {error.message}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Low Stock Report</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            min={0}
            value={threshold}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) setThreshold(val);
            }}
            className="w-20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-40" />
        </div>
      ) : report && report.totalLowStockProducts > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Low Stock Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {report.totalLowStockProducts}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Estimated Restock Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatPrice(report.totalRestockCost)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {report.stores.map((store) => (
              <Collapsible key={store.storeId} defaultOpen>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer select-none hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          <Link
                            to={`/stores/${store.storeId}`}
                            className="hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {store.storeName}
                          </Link>
                        </CardTitle>
                        <Badge variant="destructive">
                          {store.lowStockCount} low
                        </Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Deficit</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {store.products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <Link
                                  to={`/products/${product.id}`}
                                  className="font-medium hover:underline"
                                >
                                  {product.name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {CATEGORY_LABELS[product.category as ProductCategory] ?? product.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {formatPrice(product.price)}
                              </TableCell>
                              <TableCell className={`text-right ${quantityClass(product.quantity)}`}>
                                {product.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                {product.deficit}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </>
      ) : report ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12">
            <p className="text-lg font-medium">All products are well stocked!</p>
            <p className="text-sm text-muted-foreground">
              No products with quantity at or below {report.threshold}.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
