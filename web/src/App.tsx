import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { StoresListPage } from '@/pages/stores-list';
import { StoreDetailPage } from '@/pages/store-detail';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/stores" replace />} />
        <Route path="stores" element={<StoresListPage />} />
        <Route path="stores/:id" element={<StoreDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
