import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import GenerateContent from './pages/GenerateContent';
import SocialPresentation from './pages/SocialPresentation';
import OutputPreview from './pages/OutputPreview';
import History from './pages/History';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { api } from './services/api';

function MainLayout({ user, onLogout, backendStatus, onRefreshStatus, currentOutput, setCurrentOutput }) {
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/generate':
        return 'Generate Location Content';
      case '/social-presentation':
        return 'Social Media & Presentation Generator';
      case '/output':
        return 'Output Preview & Verification';
      case '/history':
        return 'Output History';
      case '/settings':
        return 'System Settings & Diagnostics';
      case '/profile':
        return 'User Profile';
      default:
        return 'Zenithian Platform';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar backendStatus={backendStatus} user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={getPageTitle(location.pathname)}
          onRefresh={onRefreshStatus}
          backendStatus={backendStatus}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <Routes>
            <Route path="/dashboard" element={<Dashboard user={user} backendStatus={backendStatus} />} />
            <Route
              path="/generate"
              element={<GenerateContent onGenerateSuccess={(data) => setCurrentOutput(data)} />}
            />
            <Route path="/social-presentation" element={<SocialPresentation />} />
            <Route
              path="/output"
              element={
                <OutputPreview
                  outputData={currentOutput}
                  onUpdateOutput={(updated) => setCurrentOutput(updated)}
                />
              }
            />
            <Route
              path="/history"
              element={<History onViewOutput={(data) => setCurrentOutput(data)} />}
            />
            <Route
              path="/settings"
              element={<Settings backendStatus={backendStatus} onRefreshStatus={onRefreshStatus} />}
            />
            <Route path="/profile" element={<Profile user={user} onLogout={onLogout} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zenithian_user');
    return saved ? JSON.parse(saved) : { email: 'workspace@zenithian.local', id: 'local_workspace' };
  });

  const [backendStatus, setBackendStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentOutput, setCurrentOutput] = useState(null);

  const checkBackendStatus = async () => {
    setIsRefreshing(true);
    const res = await api.fetchHealth();
    if (res.success) {
      setBackendStatus(res.data);
    } else {
      setBackendStatus({ status: 'offline', ai_configured: false });
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('zenithian_user');
    setUser({ email: 'workspace@zenithian.local', id: 'local_workspace' });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              backendStatus={backendStatus}
              onRefreshStatus={checkBackendStatus}
              currentOutput={currentOutput}
              setCurrentOutput={setCurrentOutput}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
