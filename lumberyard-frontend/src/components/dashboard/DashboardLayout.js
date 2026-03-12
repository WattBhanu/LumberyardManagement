import React from 'react';
import './DashboardLayout.css';

const DashboardLayout = ({ children, user, onLogout }) => {
  const handleLogout = () => {
    // Clear stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call the logout handler passed from parent
    onLogout();
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Lumberyard Management System</h1>
        </div>
        <div className="header-right">
          <span>Welcome, {user.name} ({user.role.replace('_', ' ')})</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          {/* Navigation items will vary based on role */}
        </ul>
      </nav>
      
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;