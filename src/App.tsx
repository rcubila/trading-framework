import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Strategy } from './pages/Strategy';
import { Trades } from './pages/Trades';
import { DisciplineTracker } from './pages/DisciplineTracker';
import { MainLayout } from './layouts/MainLayout';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Placeholder components for other routes
const Journal = () => <div style={{ color: 'white' }}>Journal Page</div>;
const ImportTrades = () => <div style={{ color: 'white' }}>Import Trades Page</div>;

// Auth callback handler
const AuthCallback = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    // Navigate to root path since we're already using basename
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/trading-framework">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="strategy" element={<Strategy />} />
            <Route path="trades" element={<Trades />} />
            <Route path="journal" element={<Journal />} />
            <Route path="discipline" element={<DisciplineTracker />} />
            <Route path="import" element={<ImportTrades />} />
          </Route>
          {/* Catch any unknown routes and redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
