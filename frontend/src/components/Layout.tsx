import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Settings, Bell, LogOut, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  logout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Bell size={24} />
          </div>
          <span className="logo-text">JobAlert</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home className="nav-icon" size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/preferences" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Search className="nav-icon" size={20} />
            <span>Preferences</span>
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Bell className="nav-icon" size={20} />
            <span>Notifications</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings className="nav-icon" size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
