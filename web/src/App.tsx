import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { StoresListPage } from '@/pages/stores-list';
import { StoreDetailPage } from '@/pages/store-detail';
import { ProductsListPage } from '@/pages/products-list';
import { ProductDetailPage } from '@/pages/product-detail';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/stores" replace />} />
        <Route path="stores" element={<StoresListPage />} />
        <Route path="stores/:id" element={<StoreDetailPage />} />
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
