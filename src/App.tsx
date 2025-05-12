import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';

// Placeholder components for other routes
const Trades = () => <div style={{ color: 'white' }}>Trades Page</div>;
const Journal = () => <div style={{ color: 'white' }}>Journal Page</div>;
const Strategy = () => <div style={{ color: 'white' }}>Strategy Page</div>;
const DisciplineTracker = () => <div style={{ color: 'white' }}>Discipline Tracker Page</div>;
const ImportTrades = () => <div style={{ color: 'white' }}>Import Trades Page</div>;

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/discipline" element={<DisciplineTracker />} />
          <Route path="/import" element={<ImportTrades />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
