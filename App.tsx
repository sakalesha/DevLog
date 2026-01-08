
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import EntriesPage from './pages/EntriesPage';
import EntryDetailPage from './pages/EntryDetailPage';
import NewEntryPage from './pages/NewEntryPage';
import PortfolioPage from './pages/PortfolioPage';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/entries" element={<EntriesPage />} />
              <Route path="/entries/:id" element={<EntryDetailPage />} />
              <Route path="/entry/new" element={<NewEntryPage />} />
              <Route path="/entry/:id/edit" element={<NewEntryPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
