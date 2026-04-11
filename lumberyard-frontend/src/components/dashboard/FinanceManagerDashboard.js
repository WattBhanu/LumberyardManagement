import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SalaryReports from './SalaryReports';
import './AdminDashboard.css';

const FinanceManagerDashboard = ({ user, onLogout, token }) => {
  const navigate = useNavigate();
  const isAdmin = user && user.role === 'ADMIN';
  const [activeView, setActiveView] = useState('overview'); // 'overview' or 'salary-reports'

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // If salary reports view is active, show it
  if (activeView === 'salary-reports') {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <div className="header-left">
              <h1>Salary Tracking</h1>
              <span className="header-badge">Daily Reports</span>
            </div>
            <div className="header-right">
              {user && (
                <span className="user-info">
                  Welcome, {user.name}
                </span>
              )}
              <button 
                onClick={() => setActiveView('overview')} 
                className="back-to-admin-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5"></path>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Finance
              </button>
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
          <SalaryReports token={token} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Finance Manager Dashboard</h1>
            <span className="header-badge">Financial Operations</span>
          </div>
          <div className="header-right">
            {user && (
              <span className="user-info">
                Welcome, {user.name}
              </span>
            )}
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="back-to-admin-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Back to Admin
              </button>
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

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon salary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Salary Tracking</h3>
            <p>Mark attendance and generate daily salary reports</p>
            <button 
              className="card-button"
              onClick={() => setActiveView('salary-reports')}
            >
              Open Salary Reports
            </button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon income">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Income Tracking</h3>
            <p>Record and monitor business income</p>
            <button className="card-button" disabled>Coming Soon</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon expenses">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <h3>Expense Tracking</h3>
            <p>Record and track business expenses</p>
            <button className="card-button" disabled>Coming Soon</button>
          </div>

          <div className="dashboard-card">
            <div className="card-icon summary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
              </svg>
            </div>
            <h3>Profit & Loss Summary</h3>
            <p>View profit and loss analysis</p>
            <button className="card-button" disabled>Coming Soon</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagerDashboard;