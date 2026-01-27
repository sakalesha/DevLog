
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import EntryDetailPage from './pages/EntryDetailPage';
import NewEntryPage from './pages/NewEntryPage';
import PortfolioPage from './pages/PortfolioPage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/entries/:id" element={<EntryDetailPage />} />
              <Route path="/entry/new" element={<NewEntryPage />} />
              <Route path="/entry/:id/edit" element={<NewEntryPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
            </Routes>

          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;
