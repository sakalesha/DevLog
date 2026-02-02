import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import EntryEditorPage from './pages/EntryEditorPage';
import EntryDetailPage from './pages/EntryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/challenges" element={
            <ProtectedRoute>
              <Layout>
                <ChallengesPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/challenges/:id" element={
            <ProtectedRoute>
              <Layout>
                <ChallengeDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/entry/new" element={
            <ProtectedRoute>
              <Layout>
                <EntryEditorPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/entry/:id/edit" element={
            <ProtectedRoute>
              <Layout>
                <EntryEditorPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/entries/:id" element={
            <ProtectedRoute>
              <Layout>
                <EntryDetailPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/entries" element={
            <ProtectedRoute>
              <Layout>
                {/* Reuse Dashboard logic or a simplified list if desired */}
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
