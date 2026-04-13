import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import API from '../../services/api';
import './AdminDashboard.css';

const LaborManagerDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user && user.role === 'ADMIN';
  const [stats, setStats] = useState({ totalWorkers: 0, activeWorkers: 0, inactiveWorkers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/workers/stats');
      console.log('Worker Stats API Response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching worker stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
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
        {error && <div className="stats-error">{error}</div>}
        <div className="summary-grid">
          <div className="summary-card highlight-blue">
            <h4>Total Workers</h4>
            <div className="stat-value">
              {loading ? (
                <span className="stat-loading">...</span>
              ) : (
                stats.totalWorkers !== undefined && stats.totalWorkers !== null ? stats.totalWorkers : (stats.total_workers || '0')
              )}
            </div>
            <div className="card-decoration">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          
          <div className="summary-card highlight-green">
            <h4>Active Workers</h4>
            <div className="stat-value">
              {loading ? <span className="stat-loading">...</span> : stats.activeWorkers}
            </div>
            <div className="card-decoration">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          
          <div className="summary-card highlight-red">
            <h4>Inactive Workers</h4>
            <div className="stat-value">
              {loading ? <span className="stat-loading">...</span> : stats.inactiveWorkers}
            </div>
            <div className="card-decoration">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
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

          <div className="dashboard-card" onClick={() => {console.log('Navigating to jobs'); navigate('jobs')}} style={{ cursor: 'pointer' }}>
            <div className="card-icon workers">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <h3>Jobs</h3>
            <p>Manage job assignments and schedules</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaborManagerDashboard;