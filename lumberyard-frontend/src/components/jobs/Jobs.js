import React from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './Jobs.css';

const Jobs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the base /jobs route
  const isBaseRoute = location.pathname === '/labor/jobs' || location.pathname === '/labor/jobs/';

  // If on a sub-route, render the Outlet
  if (!isBaseRoute) {
    return <Outlet />;
  }

  return (
    <div className="jobs-page">
      <div className="jobs-header">
        <button className="jobs-back-btn" onClick={() => navigate('/labor')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="jobs-header-text">
          <h1>Job Management</h1>
          <span className="jobs-badge">WORKFORCE PLANNING</span>
        </div>
      </div>

      <div className="jobs-main-content">
        <div className="jobs-intro">
          <h2>Manage Job Assignments & Schedules</h2>
          <p>Create jobs, assign workers, and track workforce allocation</p>
        </div>

        <div className="jobs-action-cards">
          <div 
            className="jobs-action-card" 
            onClick={() => {console.log('Navigating to assignment'); navigate('assignment')}}
          >
            <div className="jobs-card-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Job Assignment</h3>
            <p>Create jobs and assign workers to specific tasks</p>
            <div className="jobs-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>

          <div 
            className="jobs-action-card" 
            onClick={() => {console.log('Navigating to shift scheduling'); navigate('shift-scheduling')}}
          >
            <div className="jobs-card-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>Shift Schedule</h3>
            <p>View and manage worker shift schedules</p>
            <div className="jobs-card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
