import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import API from '../../services/api';
import './AdminDashboard.css';

const LaborManagerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user && user.role === 'ADMIN';
  const [stats, setStats] = useState({ totalWorkers: 0, activeWorkers: 0, inactiveWorkers: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await API.get('/workers/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching worker stats:', error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // If we are on a sub-route, render the Outlet
  const isBaseRoute = location.pathname === '/labor' || location.pathname === '/labor/';

  if (!isBaseRoute) {
    return <Outlet />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>Labor Manager Dashboard</h1>
            <span className="header-badge">Labor Operations</span>
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

        {/* Info Bars/Stats */}
        <div className="summary-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>Total Workers</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats.totalWorkers}</div>
          </div>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: 0, color: '#059669', fontSize: '0.875rem' }}>Active Workers</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats.activeWorkers}</div>
          </div>
          <div className="summary-card" style={{ padding: '1.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem' }}>Inactive Workers</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{stats.inactiveWorkers}</div>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => navigate('workers')} style={{ cursor: 'pointer' }}>
            <div className="card-icon workers">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Worker Management</h3>
            <p>View and manage worker profiles</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('attendance')} style={{ cursor: 'pointer' }}>
            <div className="card-icon attendance">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Attendance Tracking</h3>
            <p>Record and monitor worker attendance</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate('salary')} style={{ cursor: 'pointer' }}>
            <div className="card-icon salary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Salary Reports</h3>
            <p>Generate salary reports and compensation data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborManagerDashboard;