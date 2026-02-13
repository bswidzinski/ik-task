import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types/product';
import { CATEGORY_LABELS } from '@/types/product';
import { formatPrice } from '@/lib/format';

interface ProductsTableProps {
  products: Product[] | undefined;
  isLoading: boolean;
  showStore?: boolean;
  emptyMessage?: string;
}

export function ProductsTable({
  products,
  isLoading,
  showStore = true,
  emptyMessage = 'No products yet',
}: ProductsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          {showStore && <TableHead>Store</TableHead>}
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Qty</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="cursor-pointer">
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
                {CATEGORY_LABELS[product.category]}
              </Badge>
            </TableCell>
            {showStore && (
              <TableCell>
                <Link
                  to={`/stores/${product.storeId}`}
                  className="text-muted-foreground hover:underline"
                >
                  {product.store?.name}
                </Link>
              </TableCell>
            )}
            <TableCell className="text-right">
              {formatPrice(product.price)}
            </TableCell>
            <TableCell className="text-right">{product.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
