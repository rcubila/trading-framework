import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import { Trades } from './pages/Trades/Trades';
import { Journal } from './pages/Journal/Journal';
import { Strategy } from './pages/Strategy/Strategy';
import { DisciplineTracker } from './pages/DisciplineTracker/DisciplineTracker';
import { ImportTrades } from './pages/ImportTrades/ImportTrades';
import { Analytics } from './pages/Analytics/Analytics';
import Login from './pages/Login/Login';
import { Profile } from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import { UIRecommendationsPage } from './pages/UIRecommendationsPage/UIRecommendationsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DisciplineProvider } from './context/DisciplineContext';
import { AuthCallback } from './components/AuthCallback';
import { useEffect } from 'react';
import { trackPerformance } from './utils/performance';
import PlayBook from './pages/PlayBook/index';

export const App = () => {
  useEffect(() => {
    // Initialize performance tracking
    trackPerformance();
  }, []);

  const basePath = import.meta.env.VITE_BASE_PATH || '/';

  return (
    <BrowserRouter basename={basePath}>
      <AuthProvider>
        <DisciplineProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="trades" element={<Trades />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="journal" element={<Journal />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="discipline" element={<DisciplineTracker />} />
              <Route path="import" element={<ImportTrades />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ui-recommendations" element={<UIRecommendationsPage />} />
              <Route path="playbook" element={<PlayBook />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DisciplineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
