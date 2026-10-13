import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import { AssignmentListPage } from '@/pages/AssignmentListPage';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const StatisticsPage = lazy(() => import('@/pages/StatisticsPage').then(module => ({ default: module.StatisticsPage })));

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<AssignmentListPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;