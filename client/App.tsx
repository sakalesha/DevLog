import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';

// Pages
import DashboardPage from './pages/DashboardPage';
import EntryEditorPage from './pages/EntryEditorPage';
import EntryDetailPage from './pages/EntryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  return (
    <ThemeProvider>
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
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;

