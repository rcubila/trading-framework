import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Strategy } from './pages/Strategy';
import Login from './pages/Login';

// Placeholder components for other routes
const Trades = () => <div style={{ color: 'white' }}>Trades Page</div>;
const Journal = () => <div style={{ color: 'white' }}>Journal Page</div>;
const DisciplineTracker = () => <div style={{ color: 'white' }}>Discipline Tracker Page</div>;
const ImportTrades = () => <div style={{ color: 'white' }}>Import Trades Page</div>;

function App() {
  return (
    <Router basename="/trading-framework">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="strategy" element={<Strategy />} />
          <Route path="trades" element={<Trades />} />
          <Route path="journal" element={<Journal />} />
          <Route path="discipline" element={<DisciplineTracker />} />
          <Route path="import" element={<ImportTrades />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
