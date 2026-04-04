import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './hooks/useUser';
import Layout from './components/Layout';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PreferencesPage from './pages/PreferencesPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

const App: React.FC = () => {
  const { user, loading, register, updatePreferences, logout } = useUser();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/register" 
          element={<RegisterPage register={register} user={user} />} 
        />
        
        <Route 
          path="/" 
          element={
            <Layout user={user || { name: 'Guest User', phone: 'guest_user' } as any} logout={logout}>
              <DashboardPage />
            </Layout>
          } 
        />

        <Route 
          path="/preferences" 
          element={
            user ? (
              <Layout user={user} logout={logout}>
                <PreferencesPage user={user} updatePreferences={updatePreferences} />
              </Layout>
            ) : (
              <Navigate to="/register" />
            )
          } 
        />

        <Route 
          path="/notifications" 
          element={
            user ? (
              <Layout user={user} logout={logout}>
                <NotificationsPage user={user} setUser={() => {}} />
              </Layout>
            ) : (
              <Navigate to="/register" />
            )
          } 
        />

        <Route 
          path="/settings" 
          element={
            user ? (
              <Layout user={user} logout={logout}>
                <SettingsPage />
              </Layout>
            ) : (
              <Navigate to="/register" />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
