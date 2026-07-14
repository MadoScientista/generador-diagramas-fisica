import { Routes, Route } from 'react-router-dom';
import { PageLayout } from './ui/components/layout/PageLayout.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MRUGeneratorPage } from './pages/MRUGeneratorPage.tsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route index element={<HomePage />} />
        <Route path="generador/mru" element={<MRUGeneratorPage />} />
      </Route>
    </Routes>
  );
}
