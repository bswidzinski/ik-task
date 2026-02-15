import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { StoresListPage } from '@/pages/stores-list';
import { StoreDetailPage } from '@/pages/store-detail';
import { ProductsListPage } from '@/pages/products-list';
import { ProductDetailPage } from '@/pages/product-detail';
import { LowStockReportPage } from '@/pages/low-stock-report';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/stores" replace />} />
        <Route path="stores" element={<StoresListPage />} />
        <Route path="stores/:id" element={<StoreDetailPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="reports/low-stock" element={<LowStockReportPage />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center gap-4 py-12">
              <h1 className="text-2xl font-bold">Page not found</h1>
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist.
              </p>
              <Link
                to="/stores"
                className="text-sm underline hover:text-foreground"
              >
                Go to Stores
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
