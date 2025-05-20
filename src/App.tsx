import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import { Trades } from './pages/Trades';
import { Journal } from './pages/Journal';
import { Strategy } from './pages/Strategy';
import { DisciplineTracker } from './pages/DisciplineTracker';
import { ImportTrades } from './pages/ImportTrades';
import { Analytics } from './pages/Analytics';
import Login from './pages/Login';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { UIRecommendationsPage } from './pages/UIRecommendationsPage';
import { PlayBook } from './pages/PlayBook';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { DisciplineProvider } from './context/DisciplineContext';
import { AuthCallback } from './components/AuthCallback';
import { useEffect } from 'react';
import { trackPerformance } from './utils/performance';
import { AnimatedPage } from './components/AnimatedPage';
import { AnimationDemo } from './pages/AnimationDemo';

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
              <Route path="analytics" element={
                <AnimatedPage>
                  <Analytics />
                </AnimatedPage>
              } />
              <Route path="journal" element={<Journal />} />
              <Route path="strategy" element={<Strategy />} />
              <Route path="playbook" element={
                <AnimatedPage>
                  <PlayBook />
                </AnimatedPage>
              } />
              <Route path="discipline" element={<DisciplineTracker />} />
              <Route path="import" element={<ImportTrades />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ui-recommendations" element={<UIRecommendationsPage />} />
            </Route>
            <Route path="/animation-demo" element={
              <AnimatedPage>
                <AnimationDemo />
              </AnimatedPage>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DisciplineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
