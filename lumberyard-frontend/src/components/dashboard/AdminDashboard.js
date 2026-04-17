import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserRegistration from './UserRegistration';
import './AdminDashboard.css';

const AdminDashboard = ({ user, onLogout, token }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'user-registration':
        return <UserRegistration token={token} />;
      case 'overview':
      default:
        return (
          <div className="admin-dashboard-content">
            <div className="dashboard-cards">
              <div className="dashboard-card">
                <div className="card-icon users">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>User Management</h3>
                <p>Create and manage users across all roles</p>
                <button 
                  className="card-button"
                  onClick={() => setActiveTab('user-registration')}
                >
                  Register New User
                </button>
              </div>
              
              <div className="dashboard-card">
                <div className="card-icon main">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                </div>
                <h3>Inventory & Operations Dashboard</h3>
                <p>Access inventory, production, and operations</p>
                <button 
                  className="card-button"
                  onClick={() => navigate('/main')}
                >
                  Open Dashboard
                </button>
              </div>

              <div className="dashboard-card">
                <div className="card-icon labor">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Labor Dashboard</h3>
                <p>Access labor management and worker tracking</p>
                <button 
                  className="card-button"
                  onClick={() => navigate('/labor')}
                >
                  Open Labor
                </button>
              </div>

              <div className="dashboard-card">
                <div className="card-icon finance">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3>Finance Dashboard</h3>
                <p>Access financial reports and expense tracking</p>
                <button 
                  className="card-button"
                  onClick={() => navigate('/finance')}
                >
                  Open Finance
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <span className="header-badge">System Administration</span>
          </div>
          <div className="header-right">
            {user && (
              <span className="user-info">
                Welcome, {user.name}
              </span>
            )}
            <button onClick={handleLogout} className="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </div>

        {activeTab !== 'overview' && (
          <div className="admin-header">
            <button 
              className="back-button"
              onClick={() => setActiveTab('overview')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Dashboard
            </button>
          </div>
        )}
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;